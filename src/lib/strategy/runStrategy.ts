
import { supabase } from '@/lib/supabase';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';

/**
 * Shared utility to execute a strategy
 * Used by both the edge function and the client-side implementation
 */
export async function runStrategy(input: ExecuteStrategyInput | undefined): Promise<ExecuteStrategyResult> {
  const startTime = performance.now();
  
  // Input validation
  if (!input) {
    return {
      success: false,
      error: 'Strategy ID is required',
      executionTime: (performance.now() - startTime) / 1000
    };
  }

  if (!input.strategyId) {
    return {
      success: false,
      error: 'Strategy ID is required',
      executionTime: (performance.now() - startTime) / 1000
    };
  }

  if (!input.tenantId) {
    return {
      success: false,
      error: 'Tenant ID is required',
      executionTime: (performance.now() - startTime) / 1000
    };
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
      // Don't fail if logging fails
      console.error("Logging failed but continuing execution:", logError);
    }
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: {
        strategy_id: input.strategyId,
        tenant_id: input.tenantId,
        user_id: input.userId,
        options: input.options || {}
      }
    });
    
    if (error) {
      throw new Error(`Error executing strategy: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error(data?.error || 'Unknown error executing strategy');
    }
    
    // Log successful execution
    try {
      await logSystemEvent(
        input.tenantId,
        'strategy',
        'execute_strategy_completed',
        {
          strategy_id: input.strategyId,
          execution_id: data.execution_id,
          execution_time: data.execution_time,
          status: data.status
        }
      );
    } catch (logError) {
      // Don't fail if logging fails
      console.error("Logging completion failed but continuing:", logError);
    }
    
    // Return result
    return {
      success: true,
      executionId: data.execution_id,
      strategyId: input.strategyId,
      status: data.status,
      executionTime: data.execution_time,
      pluginsExecuted: data.plugins_executed,
      successfulPlugins: data.successful_plugins,
      xpEarned: data.xp_earned,
      outputs: data.outputs || {}
    };
    
  } catch (error: any) {
    console.error("Error in runStrategy:", error);
    
    // Log error
    try {
      await logSystemEvent(
        input.tenantId,
        'strategy',
        'execute_strategy_error',
        {
          strategy_id: input.strategyId,
          error: error.message,
          user_id: input.userId || 'system'
        }
      );
    } catch (logError) {
      // Don't fail if logging fails
      console.error("Logging error failed:", logError);
    }
    
    return {
      success: false,
      error: error.message,
      executionTime: (performance.now() - startTime) / 1000
    };
  }
}

export default runStrategy;
