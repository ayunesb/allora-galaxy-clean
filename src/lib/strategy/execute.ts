
import { supabase } from '@/lib/supabase';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import { camelToSnakeObject } from '@/lib/utils/dataConversion';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { toast } from '@/components/ui/use-toast';

// Constants for retry configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY_MS: 500,
  BACKOFF_FACTOR: 2
};

/**
 * Execute a strategy with retry logic and comprehensive error handling
 * @param input Strategy execution parameters
 * @returns Result of execution
 */
export async function execute(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  // Validate input before proceeding
  if (!input.strategyId) {
    const error = new Error('Strategy ID is required');
    toast({
      title: 'Validation Error',
      description: error.message,
      variant: 'destructive'
    });
    return {
      success: false,
      error: error.message,
      executionTime: 0,
      status: 'error'
    };
  }
  
  if (!input.tenantId) {
    const error = new Error('Tenant ID is required');
    toast({
      title: 'Validation Error',
      description: error.message,
      variant: 'destructive'
    });
    return {
      success: false,
      error: error.message,
      executionTime: 0,
      status: 'error'
    };
  }

  console.log('Executing strategy:', input.strategyId);
  
  try {
    // Convert camelCase input to snake_case for the edge function
    const snakeInput = camelToSnakeObject(input);
    
    // Add execution start timestamp
    const startTime = performance.now();
    
    // Call the edge function with retry logic
    const result = await executeWithRetry(
      async () => {
        const { data, error } = await supabase.functions.invoke('executeStrategy', {
          body: snakeInput
        });
        
        if (error) {
          console.error('Error executing strategy:', error);
          throw error;
        }
        
        return { data, error };
      },
      input.strategyId
    );
    
    const { data, error } = result;
    
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
      
      // Show toast notification
      toast({
        title: 'Strategy Execution Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      
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
    
    // Show success toast
    toast({
      title: 'Strategy Executed',
      description: `Successfully executed with ${data.successful_plugins || 0} plugins`,
      variant: 'default'
    });
    
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
    
    // Show error toast
    toast({
      title: 'Strategy Execution Error',
      description: err.message || 'An unexpected error occurred',
      variant: 'destructive'
    });
    
    return {
      success: false,
      error: err.message || 'Unknown error occurred',
      executionTime: 0,
      status: 'error'
    };
  }
}

/**
 * Helper function to execute a strategy with retry logic
 */
async function executeWithRetry<T>(operation: () => Promise<T>, strategyId: string): Promise<T> {
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < RETRY_CONFIG.MAX_RETRIES) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if error is retryable
      const isRetryable = isRetryableError(error);
      
      if (!isRetryable) {
        console.log(`Non-retryable error for strategy ${strategyId}:`, error);
        throw error;
      }
      
      retryCount++;
      
      if (retryCount >= RETRY_CONFIG.MAX_RETRIES) {
        console.log(`Max retries (${RETRY_CONFIG.MAX_RETRIES}) reached for strategy ${strategyId}`);
        throw new Error(`Failed after ${RETRY_CONFIG.MAX_RETRIES} attempts: ${error.message}`);
      }
      
      // Calculate backoff delay with jitter
      const delay = calculateBackoffDelay(retryCount);
      console.log(`Retrying strategy ${strategyId} execution in ${delay}ms (attempt ${retryCount}/${RETRY_CONFIG.MAX_RETRIES})`);
      
      await sleep(delay);
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw lastError || new Error('Unknown error during strategy execution');
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: any): boolean {
  const errorMessage = (error?.message || '').toLowerCase();
  const errorStatus = error?.status;
  
  // Network-related errors
  if (
    errorMessage.includes('network') || 
    errorMessage.includes('timeout') || 
    errorMessage.includes('connection')
  ) {
    return true;
  }
  
  // Server errors (5xx) and rate limiting (429)
  if (
    errorStatus >= 500 || 
    errorStatus === 429
  ) {
    return true;
  }
  
  // Supabase specific errors that might be temporary
  if (
    errorMessage.includes('too many requests') ||
    errorMessage.includes('backend is unhealthy') ||
    errorMessage.includes('database connection')
  ) {
    return true;
  }
  
  // Client errors (4xx except 429) are typically not retryable
  if (errorStatus >= 400 && errorStatus < 500) {
    return false;
  }
  
  // Default to not retry for unknown errors
  return false;
}

/**
 * Calculate backoff delay with jitter
 */
function calculateBackoffDelay(attempt: number): number {
  const baseDelay = RETRY_CONFIG.INITIAL_DELAY_MS * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, attempt - 1);
  const jitter = Math.random() * 0.3 * baseDelay; // Add up to 30% jitter
  return Math.floor(baseDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
