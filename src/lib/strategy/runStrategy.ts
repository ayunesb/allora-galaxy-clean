
import { supabase } from '@/integrations/supabase/client';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/strategy/fixed';
import logSystemEvent from '@/lib/system/logSystemEvent';

/**
 * Shared utility function for executing a strategy
 * Can be used from both frontend code and edge functions
 */
export async function runStrategy(input?: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  try {
    // Input validation
    if (!input) {
      return { 
        success: false, 
        error: 'Strategy ID is required' 
      };
    }

    if (!input.strategyId) {
      return { 
        success: false, 
        error: 'Strategy ID is required' 
      };
    }
    
    if (!input.tenantId) {
      return { 
        success: false, 
        error: 'Tenant ID is required' 
      };
    }

    // Convert camelCase to snake_case for the edge function
    const edgeFunctionInput = {
      strategy_id: input.strategyId,
      tenant_id: input.tenantId,
      user_id: input.userId,
      options: input.options
    };
    
    // Invoke the edge function via Supabase
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: edgeFunctionInput
    });
    
    if (error) {
      // Log error to Supabase
      await logSystemEvent(
        'strategy',
        'error',
        {
          description: `Error executing strategy: ${error.message}`,
          strategy_id: input.strategyId,
          error: error.message,
          stack: error.stack
        },
        input.tenantId
      );
      
      return {
        success: false,
        error: error.message
      };
    }
    
    // Map snake_case response to camelCase format
    const result: ExecuteStrategyResult = {
      success: data.success,
      error: data.error,
      executionId: data.execution_id,
      executionTime: data.execution_time,
      outputs: data.outputs,
      results: data.results,
      logs: data.logs
    };
    
    // Log successful execution
    if (result.success) {
      await logSystemEvent(
        'strategy',
        'info',
        {
          description: 'Strategy executed successfully',
          strategy_id: input.strategyId,
          execution_id: result.executionId,
          execution_time: result.executionTime
        },
        input.tenantId
      );
    } else {
      await logSystemEvent(
        'strategy',
        'warning',
        {
          description: `Strategy execution failed: ${result.error}`,
          strategy_id: input.strategyId,
          error: result.error
        },
        input.tenantId
      );
    }
    
    return result;
  } catch (error: any) {
    // Handle unexpected errors
    console.error('Unexpected error in runStrategy:', error);
    
    // Attempt to log the error to Supabase
    try {
      await logSystemEvent(
        'strategy',
        'error',
        {
          description: `Unexpected error in runStrategy: ${error.message}`,
          strategy_id: input?.strategyId,
          error: error.message,
          stack: error.stack
        },
        input?.tenantId || 'system'
      );
    } catch (logError) {
      console.error('Failed to log error to Supabase:', logError);
    }
    
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

export default runStrategy;
