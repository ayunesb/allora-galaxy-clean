
import { supabase } from '@/lib/supabase';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import { camelToSnakeObject } from '@/lib/utils/dataConversion';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Export the execute function
export async function execute(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  try {
    // Input validation
    if (!input.strategyId) {
      throw new Error('Strategy ID is required');
    }
    
    if (!input.tenantId) {
      throw new Error('Tenant ID is required');
    }

    console.log('Executing strategy:', input.strategyId);
    
    // Convert camelCase input to snake_case for the edge function
    const snakeInput = camelToSnakeObject(input);
    
    // Add execution start timestamp
    const startTime = performance.now();
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: snakeInput
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
        execution_id: data.execution_id,
        execution_time: executionTime,
        plugins_executed: data.plugins_executed,
        successful_plugins: data.successful_plugins,
        xp_earned: data.xp_earned
      },
      input.tenantId
    );
    
    // Convert snake_case response to camelCase as needed
    return {
      success: data.success,
      executionId: data.execution_id,
      executionTime: executionTime,
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
    console.error('Error in execute strategy:', err);
    
    return {
      success: false,
      error: err.message || 'Unknown error occurred',
      executionTime: 0,
      status: 'error'
    };
  }
}
