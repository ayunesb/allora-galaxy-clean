
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

export interface EvolutionOptions {
  evolutionThreshold?: number;
  minimumExecutions?: number;
  failureRateThreshold?: number;
  staleDays?: number;
}

export interface EvolutionResult {
  success: boolean;
  evolved: number;
  agents: Array<{
    id: string;
    previousId: string;
    performance: number;
  }>;
  message: string;
  error?: string;
}

/**
 * Triggers automatic evolution of agents based on performance metrics
 * @param tenantId Optional tenant ID to filter agents by tenant
 * @param options Configuration options for the evolution process
 * @returns Details of the evolution process
 */
export async function autoEvolveAgents(
  tenantId?: string,
  options?: EvolutionOptions
): Promise<EvolutionResult> {
  try {
    // Log the start of the evolution process
    await logSystemEvent(
      'agent',
      'auto_evolve_started',
      {
        tenant_id: tenantId,
        options
      },
      tenantId
    ).catch(() => {
      // Non-critical error, continue execution
      console.warn('Failed to log evolution start event');
    });

    // Call the Supabase edge function to perform the evolution
    const { data, error } = await supabase.functions.invoke('autoEvolveAgents', {
      body: {
        tenant_id: tenantId,
        options
      }
    });

    // Handle errors from the function call
    if (error) {
      console.error('Error calling autoEvolveAgents function:', error);
      
      // Log the error
      await logSystemEvent(
        'agent',
        'error',
        {
          error: error.message,
          tenant_id: tenantId,
          function: 'autoEvolveAgents'
        },
        tenantId
      ).catch(() => {
        // Ignore logging errors
      });

      return {
        success: false,
        evolved: 0,
        agents: [],
        message: `Error evolving agents: ${error.message}`,
        error: error.message
      };
    }

    // Log successful completion
    await logSystemEvent(
      'agent',
      'auto_evolve_completed',
      {
        evolved: data.evolved,
        agents: data.agents,
        tenant_id: tenantId
      },
      tenantId
    ).catch(() => {
      // Ignore logging errors
    });

    // Return the results
    return data as EvolutionResult;
  } catch (error: any) {
    console.error('Unexpected error in autoEvolveAgents:', error);
    
    // Log the error
    await logSystemEvent(
      'agent',
      'error',
      {
        error: error?.message || 'Unknown error',
        tenant_id: tenantId,
        function: 'autoEvolveAgents'
      },
      tenantId
    ).catch(() => {
      // Ignore logging errors
    });

    return {
      success: false,
      evolved: 0,
      agents: [],
      message: `Unexpected error: ${error?.message || 'Unknown error'}`,
      error: error?.message || 'Unknown error'
    };
  }
}
