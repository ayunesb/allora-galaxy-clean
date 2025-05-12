
import { supabase } from '@/lib/supabase';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Executes a strategy using the executeStrategy edge function
 * 
 * @param input Strategy execution input parameters
 * @returns Result of the strategy execution
 */
export async function runStrategy(
  input: ExecuteStrategyInput | undefined
): Promise<ExecuteStrategyResult> {
  try {
    // Input validation
    if (!input) {
      return {
        success: false,
        error: 'Strategy ID is required',
        executionTime: 0,
        status: 'error'
      };
    }

    if (!input.strategyId) {
      return {
        success: false,
        error: 'Strategy ID is required',
        executionTime: 0,
        status: 'error'
      };
    }
    
    if (!input.tenantId) {
      return {
        success: false,
        error: 'Tenant ID is required',
        executionTime: 0,
        status: 'error'
      };
    }

    // Add execution start timestamp
    const startTime = performance.now();
    
    // Prepare request body
    const requestBody = {
      strategy_id: input.strategyId,
      tenant_id: input.tenantId,
      user_id: input.userId,
      options: input.options
    };
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: requestBody
    });
    
    // Calculate execution time if not provided by edge function
    const executionTime = data?.execution_time || (performance.now() - startTime) / 1000;
    
    if (error) {
      console.error('Error executing strategy:', error);
      
      // Log error
      await logSystemEvent(
        'strategy',
        'error',
        {
          description: `Error executing strategy: ${error.message}`,
          event_type: 'strategy_execution_failed',
          strategy_id: input.strategyId,
          tenant_id: input.tenantId,
          error: error.message
        },
        input.tenantId
      );
      
      return {
        success: false,
        error: `Error executing strategy: ${error.message}`,
        executionTime,
        status: 'error'
      };
    }
    
    // Log successful execution
    await logSystemEvent(
      'strategy',
      'execute',
      {
        description: `Strategy ${input.strategyId} executed successfully`,
        event_type: 'strategy_executed',
        strategy_id: input.strategyId,
        tenant_id: input.tenantId,
        user_id: input.userId,
        execution_id: data.execution_id,
        execution_time: executionTime,
        plugins_executed: data.plugins_executed,
        successful_plugins: data.successful_plugins,
        xp_earned: data.xp_earned
      },
      input.tenantId
    );
    
    // Return success response
    return {
      success: true,
      executionId: data.execution_id,
      executionTime: executionTime,
      status: data.status,
      pluginsExecuted: data.plugins_executed,
      successfulPlugins: data.successful_plugins,
      xpEarned: data.xp_earned,
      results: data.results,
      outputs: data.outputs,
      logs: data.logs
    };
  } catch (err: any) {
    console.error('Error in runStrategy:', err);
    
    return {
      success: false,
      error: err.message || 'Unknown error occurred',
      executionTime: 0,
      status: 'error'
    };
  }
}

export default runStrategy;
