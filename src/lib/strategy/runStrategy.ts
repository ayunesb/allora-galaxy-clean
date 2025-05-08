
import { ExecuteStrategyInput, ExecuteStrategyResult, camelToSnake } from '@/types/fixed';
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Execute a strategy
 * This is a shared utility that can be used both in edge functions and client-side code
 * @param input Strategy execution input
 * @returns Strategy execution result
 */
export async function runStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  const startTime = Date.now();
  try {
    // Input validation
    if (!input?.strategyId) {
      return { success: false, error: 'Strategy ID is required' };
    }

    if (!input?.tenantId) {
      return { success: false, error: 'Tenant ID is required' };
    }

    // Convert input to snake_case for the edge function
    const snakeCaseInput = camelToSnake(input);
    
    // Record the execution attempt
    try {
      await logSystemEvent(
        input.tenantId, 
        'strategy', 
        'execute_strategy_started', 
        { strategy_id: input.strategyId, user_id: input.userId }
      );
    } catch (logError) {
      // Continue even if logging fails
      console.warn('Failed to log strategy execution start:', logError);
    }

    // Call the executeStrategy edge function with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;
    
    while (attempts < maxAttempts) {
      try {
        const { data, error } = await supabase.functions.invoke('executeStrategy', {
          body: snakeCaseInput
        });

        if (error) {
          lastError = error;
          attempts++;
          
          if (attempts < maxAttempts) {
            // Exponential backoff retry
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
            continue;
          }
          
          throw new Error(`Error executing strategy: ${error.message}`);
        }

        // Log successful execution
        try {
          await logSystemEvent(
            input.tenantId,
            'strategy',
            'execute_strategy_completed',
            { 
              strategy_id: input.strategyId, 
              execution_time: data.executionTime,
              execution_id: data.execution_id
            }
          );
        } catch (logError) {
          console.warn('Failed to log strategy execution completion:', logError);
        }

        return data as ExecuteStrategyResult;
      } catch (retryError) {
        lastError = retryError;
        attempts++;
        
        if (attempts < maxAttempts) {
          // Exponential backoff retry
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
          continue;
        }
        
        break;
      }
    }

    // If we get here, all retries failed
    // Log the error but don't stop execution
    try {
      await logSystemEvent(
        input.tenantId,
        'strategy',
        'execute_strategy_error',
        { 
          strategy_id: input.strategyId, 
          error: lastError?.message || 'Max retry attempts reached'
        }
      );
    } catch (logError) {
      console.warn('Failed to log strategy execution error:', logError);
    }
    
    throw new Error(`Error executing strategy after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`);
  } catch (error: any) {
    console.error('Error executing strategy:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred',
      executionTime: (Date.now() - startTime) / 1000
    };
  }
}
