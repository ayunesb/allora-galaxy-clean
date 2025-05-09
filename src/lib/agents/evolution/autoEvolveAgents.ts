
import { supabase } from '@/integrations/supabase/client';

/**
 * Triggers the autoEvolveAgents edge function
 * This function automatically evolves agents based on their performance
 * 
 * @param tenantId Optional tenant ID to limit evolution to a specific tenant
 * @param options Optional configuration options
 * @returns Result of the auto evolution process
 */
export async function autoEvolveAgents(
  tenantId?: string,
  options?: {
    evolutionThreshold?: number;
    minimumExecutions?: number;
    failureRateThreshold?: number;
    staleDays?: number;
    batchSize?: number;
  }
): Promise<{
  success: boolean;
  evolved: number;
  agents: any[];
  message: string;
  error?: string;
}> {
  try {
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('autoEvolveAgents', {
      body: {
        tenant_id: tenantId,
        options
      }
    });

    if (error) {
      console.error('Error calling autoEvolveAgents:', error);
      return {
        success: false,
        evolved: 0,
        agents: [],
        message: `Auto-evolution failed: ${error.message}`,
        error: error.message
      };
    }

    return data || { 
      success: false, 
      evolved: 0, 
      agents: [], 
      message: 'Unknown error occurred' 
    };
  } catch (err: any) {
    console.error('Error in autoEvolveAgents:', err);
    return {
      success: false,
      evolved: 0,
      agents: [],
      message: `Auto-evolution failed: ${err.message}`,
      error: err.message
    };
  }
}
