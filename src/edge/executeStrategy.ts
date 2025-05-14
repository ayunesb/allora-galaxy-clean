
import { supabase } from '@/integrations/supabase/client';
import { ExecuteStrategyInputSnakeCase, ExecuteStrategyResult } from '@/types/fixed';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { toast } from '@/components/ui/use-toast';

// Constants for retry configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY_MS: 500,
  BACKOFF_FACTOR: 2
};

/**
 * Validate the input for strategy execution
 * @param input The input to validate
 * @returns Object containing validation result and errors
 */
function validateInput(input: ExecuteStrategyInputSnakeCase): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  if (!input.strategy_id) {
    errors.push('Strategy ID is required');
  }
  
  if (!input.tenant_id) {
    errors.push('Tenant ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Execute a strategy with the given inputs
 * @param input The strategy execution parameters
 * @returns The result of the execution
 */
export async function executeStrategy(input: ExecuteStrategyInputSnakeCase): Promise<ExecuteStrategyResult> {
  // Validate input first
  const validation = validateInput(input);
  if (!validation.isValid) {
    return {
      success: false,
      error: `Validation failed: ${validation.errors.join(', ')}`,
      executionTime: 0,
      status: 'failed'
    };
  }
  
  console.log('Calling executeStrategy edge function with:', {
    strategyId: input.strategy_id,
    tenantId: input.tenant_id
  });
  
  return executeWithRetry(
    async () => {
      try {
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
        // Log strategy execution error
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
        
        // Re-throw the error to be handled by the retry mechanism
        throw error;
      }
    },
    input.strategy_id
  );
}

/**
 * Execute a strategy with retry logic
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>, 
  strategyId: string
): Promise<T> {
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < RETRY_CONFIG.MAX_RETRIES) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Determine if error is retryable
      const isRetryable = error.message?.includes('network') || 
                          error.message?.includes('timeout') || 
                          error.message?.includes('connection') ||
                          error.status === 503 || 
                          error.status === 429;
      
      if (!isRetryable) {
        console.error(`Non-retryable error for strategy ${strategyId}:`, error);
        throw error;
      }
      
      retryCount++;
      
      if (retryCount >= RETRY_CONFIG.MAX_RETRIES) {
        console.error(`Max retries (${RETRY_CONFIG.MAX_RETRIES}) reached for strategy ${strategyId}`);
        throw new Error(`Failed after ${RETRY_CONFIG.MAX_RETRIES} attempts: ${error.message}`);
      }
      
      // Calculate backoff delay with jitter
      const baseDelay = RETRY_CONFIG.INITIAL_DELAY_MS * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, retryCount - 1);
      const jitter = Math.random() * 0.3 * baseDelay; // Add up to 30% jitter
      const delay = Math.floor(baseDelay + jitter);
      
      console.log(`Retrying strategy ${strategyId} execution in ${delay}ms (attempt ${retryCount}/${RETRY_CONFIG.MAX_RETRIES})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Log error after all retries have failed
  try {
    await logSystemEvent(
      'strategy',
      'error',
      {
        description: `Strategy execution failed after ${RETRY_CONFIG.MAX_RETRIES} retries`,
        event_type: 'strategy_execution_failed',
        strategy_id: strategyId,
        error: lastError?.message || 'Unknown error'
      },
      'system'
    );
  } catch (logError) {
    console.error('Failed to log strategy execution error:', logError);
  }
  
  // Show error toast
  toast({
    title: 'Strategy Execution Failed',
    description: `Failed after ${RETRY_CONFIG.MAX_RETRIES} attempts. Please try again later.`,
    variant: 'destructive'
  });
  
  throw lastError || new Error(`Unknown error during strategy ${strategyId} execution`);
}
