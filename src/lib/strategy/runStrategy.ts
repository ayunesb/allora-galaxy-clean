
import { supabase } from '@/integrations/supabase/client';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import { camelToSnakeObject } from '@/lib/utils/dataConversion';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Run a strategy with the given parameters
 * @param input Strategy execution input parameters
 * @returns Promise with execution results
 */
export async function runStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  try {
    // Validate required input
    if (!input.strategyId) {
      throw new Error('Strategy ID is required');
    }

    if (!input.tenantId) {
      throw new Error('Tenant ID is required');
    }

    console.log('Running strategy:', input.strategyId);
    
    // Convert camelCase input to snake_case for the edge function
    const snakeInput = camelToSnakeObject(input);
    
    // Execute the strategy via edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: snakeInput
    });
    
    if (error) {
      console.error('Error executing strategy:', error);
      throw new Error(`Error executing strategy: ${error.message}`);
    }
    
    // Log successful execution
    await logSystemEvent(
      'strategy',
      'info',
      {
        description: `Strategy ${input.strategyId} executed successfully`,
        event_type: 'strategy_executed',
        strategy_id: input.strategyId,
        tenant_id: input.tenantId,
        user_id: input.userId,
        success: data.success,
        execution_id: data.execution_id
      },
      input.tenantId
    );
    
    // Return execution result in camelCase format
    return {
      success: data.success,
      executionId: data.execution_id,
      executionTime: data.execution_time,
      status: data.status,
      results: data.results,
      outputs: data.outputs,
      error: data.error,
      logs: data.logs,
      xpEarned: data.xp_earned,
      pluginsExecuted: data.plugins_executed,
      successfulPlugins: data.successful_plugins
    };
  } catch (err: any) {
    console.error('Error in runStrategy:', err);
    
    // Log execution error
    try {
      await logSystemEvent(
        'strategy',
        'error',
        {
          description: `Strategy execution failed: ${err.message}`,
          event_type: 'strategy_execution_failed',
          strategy_id: input.strategyId,
          tenant_id: input.tenantId,
          error: err.message
        },
        input.tenantId
      );
    } catch (logErr) {
      console.error('Failed to log strategy execution error:', logErr);
    }
    
    return {
      success: false,
      error: err.message || 'Unknown error occurred',
      executionTime: 0,
      status: 'failed'
    };
  }
}
