
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
    if (!input.strategyId) {
      return { success: false, error: 'Strategy ID is required' };
    }

    if (!input.tenantId) {
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

    // Call the executeStrategy edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: snakeCaseInput
    });

    if (error) {
      // Log the error but don't stop execution
      try {
        await logSystemEvent(
          input.tenantId,
          'strategy',
          'execute_strategy_error',
          { strategy_id: input.strategyId, error: error.message }
        );
      } catch (logError) {
        console.warn('Failed to log strategy execution error:', logError);
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
  } catch (error: any) {
    console.error('Error executing strategy:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred',
      executionTime: (Date.now() - startTime) / 1000
    };
  }
}
