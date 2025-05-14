
import { supabase } from '@/integrations/supabase/client';
import { ExecuteStrategyInputSnakeCase, ExecuteStrategyResult } from '@/types/fixed';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Execute a strategy with the given inputs
 * @param input The strategy execution parameters
 * @returns The result of the execution
 */
export async function executeStrategy(input: ExecuteStrategyInputSnakeCase): Promise<ExecuteStrategyResult> {
  const MAX_RETRIES = 3;
  let retryCount = 0;

  async function attemptExecution(): Promise<ExecuteStrategyResult> {
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
      
      // Execute the strategy via Supabase edge function
      const { data, error } = await supabase.functions.invoke('executeStrategy', {
        body: input
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Error executing strategy: ${error.message}`);
      }
      
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
          success: data.success,
          execution_id: data.execution_id,
          execution_time: data.execution_time,
          plugins_executed: data.plugins_executed,
          successful_plugins: data.successful_plugins,
        },
        input.tenant_id
      );
      
      // Return execution result in camelCase format
      return {
        success: data.success,
        status: data.success ? 'completed' : 'failed',
        executionTime: data.execution_time || 0,
        executionId: data.execution_id,
        error: data.error,
        details: data.details,
        xpEarned: data.xp_earned,
        pluginsExecuted: data.plugins_executed,
        successfulPlugins: data.successful_plugins,
        outputs: data.outputs,
        results: data.results,
        logs: data.logs
      };
    } catch (error: any) {
      // Determine if error is retryable
      const isRetryable = error.message?.includes('network') || 
                          error.message?.includes('timeout') || 
                          error.message?.includes('connection') ||
                          error.status === 503 || 
                          error.status === 429;
      
      // If error is retryable and we haven't exceeded max retries
      if (isRetryable && retryCount < MAX_RETRIES - 1) {
        retryCount++;
        console.log(`Retrying execution (${retryCount}/${MAX_RETRIES})...`);
        
        // Exponential backoff: 500ms, 1500ms, 3500ms
        const backoffTime = Math.pow(2, retryCount) * 500 - 500;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        
        // Recursive retry
        return attemptExecution();
      }
      
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
  
  // Initial execution attempt
  return attemptExecution();
}
