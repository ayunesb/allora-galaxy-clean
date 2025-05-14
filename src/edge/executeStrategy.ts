
import { supabase } from '@/integrations/supabase/client';
import { ExecuteStrategyInputSnakeCase, ExecuteStrategyResult } from '@/types/fixed';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { withRetry } from '@/lib/errors/retryUtils';

/**
 * Execute a strategy with the given inputs
 * @param input The strategy execution parameters
 * @returns The result of the execution
 */
export async function executeStrategy(input: ExecuteStrategyInputSnakeCase): Promise<ExecuteStrategyResult> {
  try {
    // Validate input
    if (!input.strategy_id) {
      return {
        success: false,
        error: 'Strategy ID is required',
        executionTime: 0,
        status: 'failed'
      };
    }
    
    if (!input.tenant_id) {
      return {
        success: false,
        error: 'Tenant ID is required',
        executionTime: 0,
        status: 'failed'
      };
    }
    
    console.log('Calling executeStrategy edge function with:', {
      strategyId: input.strategy_id,
      tenantId: input.tenant_id
    });
    
    // Execute the strategy via Supabase edge function with enhanced retry logic
    const result = await withRetry(
      async () => {
        const { data, error } = await supabase.functions.invoke('executeStrategy', {
          body: input
        });
        
        if (error) {
          console.error('Edge function error:', error);
          throw new Error(`Error executing strategy: ${error.message}`);
        }
        
        return data;
      },
      {
        maxRetries: 3,
        initialDelay: 500,
        backoffFactor: 2,
        context: { 
          strategy_id: input.strategy_id,
          tenant_id: input.tenant_id,
          operation: 'executeStrategy'
        },
        onRetry: (error, attempt, delay) => {
          console.log(`Retrying strategy execution (${attempt}/3) after error: ${error.message}, waiting ${delay}ms`);
        },
        module: 'strategy',
        tenantId: input.tenant_id
      }
    );
    
    // Log the execution
    await logSystemEvent(
      'strategy',
      'info',
      {
        description: `Strategy ${input.strategy_id} executed successfully via edge function`,
        event_type: 'strategy_executed',
        strategy_id: input.strategy_id,
        tenant_id: input.tenant_id,
        user_id: input.user_id,
        success: result.success,
        execution_id: result.execution_id,
        execution_time: result.execution_time,
        plugins_executed: result.plugins_executed,
        successful_plugins: result.successful_plugins,
      },
      input.tenant_id
    );
    
    // Return execution result in camelCase format
    return {
      success: result.success,
      status: result.success ? 'completed' : 'failed',
      executionTime: result.execution_time || 0,
      executionId: result.execution_id,
      error: result.error,
      details: result.details,
      xpEarned: result.xp_earned,
      pluginsExecuted: result.plugins_executed,
      successfulPlugins: result.successful_plugins,
      outputs: result.outputs,
      results: result.results,
      logs: result.logs
    };
  } catch (error: any) {
    // Log the error
    console.error('Error in executeStrategy edge wrapper:', error);
    try {
      await logSystemEvent(
        'strategy',
        'error',
        {
          description: `Strategy execution failed in edge wrapper: ${error.message}`,
          event_type: 'strategy_execution_failed',
          strategy_id: input.strategy_id,
          tenant_id: input.tenant_id,
          error: error.message
        },
        input.tenant_id
      );
    } catch (logError) {
      console.error('Failed to log strategy execution error:', logError);
    }
    
    return {
      success: false,
      status: 'failed',
      executionTime: 0,
      error: error.message
    };
  }
}
