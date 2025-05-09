
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import useTenantId from '@/hooks/useTenantId';

/**
 * Runs a strategy by calling the executeStrategy edge function
 * @param input The strategy execution input
 * @returns The execution result
 */
export async function runStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  try {
    const { strategyId, tenantId, userId, options = {} } = input;

    // Validate required parameters
    if (!strategyId) throw new Error('Strategy ID is required');
    if (!tenantId) throw new Error('Tenant ID is required');
    
    // Convert camelCase to snake_case for edge function
    const payload = {
      strategy_id: strategyId,
      tenant_id: tenantId,
      user_id: userId,
      options
    };

    // Log the execution attempt
    await logSystemEvent({
      module: 'strategy',
      level: 'info',
      type: 'execution-attempt',
      description: `Attempting to execute strategy ${strategyId}`,
      tenant_id: tenantId,
      metadata: { strategy_id: strategyId, options }
    });

    // Execute the strategy via edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: payload
    });

    if (error) {
      // Log execution failure
      await logSystemEvent({
        module: 'strategy',
        level: 'error',
        type: 'execution-failed',
        description: `Failed to execute strategy ${strategyId}: ${error.message}`,
        tenant_id: tenantId,
        metadata: { strategy_id: strategyId, error: error.message }
      });
      
      throw new Error(`Strategy execution failed: ${error.message}`);
    }

    // Log execution success
    await logSystemEvent({
      module: 'strategy',
      level: 'info',
      type: 'execution-completed',
      description: `Successfully executed strategy ${strategyId}`,
      tenant_id: tenantId,
      metadata: { 
        strategy_id: strategyId, 
        execution_id: data.execution_id,
        duration_ms: data.execution_time
      }
    });

    return data;
  } catch (error: any) {
    console.error('Error running strategy:', error);
    
    // Try to log the error if we have tenant ID
    if (input?.tenantId) {
      try {
        await logSystemEvent({
          module: 'strategy',
          level: 'error',
          type: 'execution-error',
          description: `Error running strategy: ${error.message}`,
          tenant_id: input.tenantId,
          metadata: { 
            strategy_id: input.strategyId,
            error: error.message,
            stack: error.stack
          }
        });
      } catch (logError) {
        console.error('Failed to log strategy execution error:', logError);
      }
    }
    
    return {
      success: false,
      strategy_id: input.strategyId,
      status: 'error',
      execution_time: 0,
      error: error.message
    };
  }
}

/**
 * React hook to run a strategy
 * @returns A function to run a strategy
 */
export function useRunStrategy() {
  const tenantId = useTenantId();

  const execute = async (strategyId: string, options = {}) => {
    if (!tenantId) {
      throw new Error('Tenant ID is required to run a strategy');
    }

    return runStrategy({
      strategyId,
      tenantId,
      options
    });
  };

  return { execute };
}

export default runStrategy;
