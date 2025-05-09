
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

interface StrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

interface StrategyExecutionResult {
  success: boolean;
  execution_id?: string;
  execution_time?: number;
  error?: string;
  details?: any;
}

/**
 * Run a strategy through the edge function
 * @param input Strategy execution input
 * @returns Execution result
 */
export async function runStrategy(
  input: StrategyInput | undefined
): Promise<StrategyExecutionResult> {
  // Input validation
  if (!input) {
    return { success: false, error: 'Strategy ID is required' };
  }
  
  if (!input.strategyId) {
    return { success: false, error: 'Strategy ID is required' };
  }
  
  if (!input.tenantId) {
    return { success: false, error: 'Tenant ID is required' };
  }
  
  try {
    // Log execution start
    try {
      await logSystemEvent(
        input.tenantId,
        'strategy',
        'execute_strategy_started',
        {
          strategy_id: input.strategyId,
          user_id: input.userId || 'system'
        }
      );
    } catch (logError) {
      console.error('Error logging strategy start:', logError);
      // Continue execution even if logging fails
    }
    
    // Convert to snake_case for the edge function
    const edgeFunctionInput = {
      strategy_id: input.strategyId,
      tenant_id: input.tenantId,
      user_id: input.userId,
      options: input.options || {}
    };
    
    // Execute strategy via edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: edgeFunctionInput
    });
    
    // Handle edge function error
    if (error) {
      // Log execution error
      try {
        await logSystemEvent(
          input.tenantId, 
          'strategy', 
          'execute_strategy_error',
          {
            strategy_id: input.strategyId,
            user_id: input.userId || 'system',
            error: error.message
          }
        );
      } catch (logError) {
        console.error('Error logging strategy error:', logError);
      }
      
      return { 
        success: false, 
        error: `Error executing strategy: ${error.message}`,
        details: error
      };
    }
    
    // Log execution success
    try {
      await logSystemEvent(
        input.tenantId, 
        'strategy', 
        'execute_strategy_completed',
        {
          strategy_id: input.strategyId,
          user_id: input.userId || 'system',
          execution_id: data?.execution_id,
          execution_time: data?.execution_time
        }
      );
    } catch (logError) {
      console.error('Error logging strategy completion:', logError);
    }
    
    // Return execution result
    return {
      success: true,
      execution_id: data?.execution_id,
      execution_time: data?.execution_time,
      ...data
    };
  } catch (error: any) {
    // Log unexpected error
    try {
      await logSystemEvent(
        input.tenantId, 
        'strategy', 
        'execute_strategy_error',
        {
          strategy_id: input.strategyId,
          user_id: input.userId || 'system',
          error: error.message
        }
      );
    } catch (logError) {
      console.error('Error logging strategy error:', logError);
    }
    
    return { 
      success: false, 
      error: `Unexpected error: ${error.message}`,
      details: error
    };
  }
}
