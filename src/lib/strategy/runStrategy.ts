
import { supabase } from '@/integrations/supabase/client';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { validateStrategyInput } from './utils/validateInput';

/**
 * Main function to run a strategy by calling the edge function
 * @param input The strategy execution input
 * @returns The strategy execution result
 */
export async function runStrategy(input?: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  try {
    // 1. Validate input
    const validation = validateStrategyInput(input as any);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Invalid input'
      };
    }

    // Convert camelCase to snake_case for edge function
    const edgeFunctionInput = {
      strategy_id: input?.strategyId,
      tenant_id: input?.tenantId,
      user_id: input?.userId,
      options: input?.options
    };
    
    // 2. Log execution start
    try {
      await logSystemEvent(
        input!.tenantId,
        'strategy',
        'execute_strategy_started',
        {
          strategy_id: input?.strategyId,
          user_id: input?.userId,
          options: input?.options
        }
      );
    } catch (logError) {
      console.error('Error logging strategy start:', logError);
      // Continue execution even if logging fails
    }
    
    // 3. Call the edge function with retry logic
    const MAX_RETRIES = 1;
    const RETRY_DELAY = 1500;
    
    let retryCount = 0;
    let response;
    
    while (retryCount <= MAX_RETRIES) {
      try {
        response = await supabase.functions.invoke(
          'executeStrategy',
          {
            body: edgeFunctionInput
          }
        );
        
        // Break the loop if we got a successful response or a non-retryable error
        if (response.data || (response.error && !isTemporaryError(response.error))) {
          break;
        }
        
        // If we have a temporary error and retries left, wait and try again
        retryCount++;
        if (retryCount <= MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
        
      } catch (invokeError) {
        console.error('Error invoking strategy edge function:', invokeError);
        
        // Log the error and handle retry if applicable
        retryCount++;
        if (retryCount <= MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          // If we've exhausted retries, return error
          return {
            success: false,
            strategy_id: input?.strategyId,
            error: `Failed to invoke edge function: ${invokeError instanceof Error ? invokeError.message : String(invokeError)}`
          };
        }
      }
    }
    
    // 4. Process the response
    if (response?.error) {
      // Log execution error
      try {
        await logSystemEvent(
          input!.tenantId,
          'strategy',
          'execute_strategy_error',
          {
            strategy_id: input?.strategyId,
            error: response.error.message || String(response.error)
          }
        );
      } catch (logError) {
        console.error('Error logging strategy error:', logError);
      }
      
      // Return error result
      return {
        success: false,
        strategy_id: input?.strategyId,
        error: `Error executing strategy: ${response.error.message || String(response.error)}`
      };
    }
    
    // 5. Log execution completed
    try {
      await logSystemEvent(
        input!.tenantId,
        'strategy',
        'execute_strategy_completed',
        {
          strategy_id: input?.strategyId,
          execution_id: response?.data?.execution_id,
          execution_time: response?.data?.execution_time,
          status: response?.data?.status
        }
      );
    } catch (logError) {
      console.error('Error logging strategy completion:', logError);
    }
    
    // 6. Return success result
    return {
      success: true,
      strategy_id: input?.strategyId,
      execution_id: response?.data?.execution_id,
      execution_time: response?.data?.execution_time,
      status: response?.data?.status,
      message: response?.data?.message,
      plugins_executed: response?.data?.plugins_executed,
      successful_plugins: response?.data?.successful_plugins,
      xp_earned: response?.data?.xp_earned,
      data: response?.data?.data
    };
    
  } catch (error) {
    console.error('Unexpected error in runStrategy:', error);
    
    // Attempt to log the error
    try {
      if (input?.tenantId) {
        await logSystemEvent(
          input.tenantId,
          'strategy',
          'execute_strategy_unexpected_error',
          {
            strategy_id: input.strategyId,
            error: error instanceof Error ? error.message : String(error)
          }
        );
      }
    } catch (logError) {
      console.error('Error logging unexpected error:', logError);
    }
    
    // Return error result
    return {
      success: false,
      strategy_id: input?.strategyId,
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Helper to determine if an error is temporary and can be retried
function isTemporaryError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || String(error);
  const temporaryErrorPatterns = [
    /timeout/i,
    /temporary/i,
    /retry/i,
    /try again/i,
    /too many requests/i,
    /rate limit/i,
    /429/,
    /503/
  ];
  
  return temporaryErrorPatterns.some(pattern => pattern.test(errorMessage));
}
