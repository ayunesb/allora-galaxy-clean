
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { StrategyExecutionResult } from './types';

export interface RunStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: {
    dryRun?: boolean;
    force?: boolean;
    timeout?: number;
    retryCount?: number;
  };
}

/**
 * Executes a strategy via the Supabase edge function
 * 
 * @param input Strategy execution parameters
 * @returns Execution result
 */
export async function runStrategy(input?: RunStrategyInput): Promise<StrategyExecutionResult> {
  // Handle invalid input
  if (!input) {
    return {
      success: false,
      error: 'Strategy ID is required',
      strategy_id: '',
      status: 'failed',
    };
  }

  const { strategyId, tenantId, userId, options = {} } = input;

  if (!strategyId) {
    return {
      success: false,
      error: 'Strategy ID is required',
      strategy_id: '',
      status: 'failed',
    };
  }

  if (!tenantId) {
    return {
      success: false,
      error: 'Tenant ID is required',
      strategy_id: strategyId,
      status: 'failed',
    };
  }
  
  // Limit retries to prevent infinite loops
  const retryCount = options.retryCount || 0;
  if (retryCount > 3) {
    return {
      success: false,
      error: 'Maximum retry attempts exceeded',
      strategy_id: strategyId,
      status: 'failed',
    };
  }

  try {
    // Log start of strategy execution
    await logSystemEvent(
      'strategy',
      'info',
      {
        strategy_id: strategyId,
        user_id: userId,
        tenant_id: tenantId,
        options,
        event_name: 'execute_strategy_started'
      },
      tenantId
    ).catch(error => {
      console.warn('Failed to log strategy start event:', error);
      // Non-critical error, continue execution
    });

    // Call the Supabase edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: {
        strategy_id: strategyId,
        tenant_id: tenantId,
        user_id: userId,
        options
      }
    });

    // If there was an error calling the function
    if (error) {
      // For temporary errors, retry with exponential backoff
      if (error.message.includes('temporary') || error.message.includes('timeout')) {
        const delay = Math.pow(2, retryCount) * 1000;
        
        console.log(`Temporary error executing strategy, retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return runStrategy({
          ...input,
          options: {
            ...options,
            retryCount: retryCount + 1
          }
        });
      }
      
      await logSystemEvent(
        'strategy',
        'error',
        {
          strategy_id: strategyId,
          error: error.message,
          status: 'failed',
          tenant_id: tenantId,
          event_name: 'execute_strategy_error'
        },
        tenantId
      ).catch(() => {/* Ignore logging errors */});

      return {
        success: false,
        error: `Error executing strategy: ${error.message}`,
        strategy_id: strategyId,
        status: 'failed'
      };
    }

    // If the function returned an error
    if (data && !data.success) {
      await logSystemEvent(
        'strategy',
        'error',
        {
          strategy_id: strategyId,
          error: data.error || 'Unknown error',
          status: 'failed',
          tenant_id: tenantId,
          event_name: 'execute_strategy_error'
        },
        tenantId
      ).catch(() => {/* Ignore logging errors */});

      return {
        success: false,
        error: data.error || 'Unknown error occurred',
        strategy_id: strategyId,
        status: 'failed',
        execution_id: data.execution_id
      };
    }

    // Log successful execution
    await logSystemEvent(
      'strategy',
      'success',
      {
        strategy_id: strategyId,
        execution_id: data.execution_id,
        status: 'completed',
        execution_time: data.execution_time,
        tenant_id: tenantId,
        event_name: 'execute_strategy_completed'
      },
      tenantId
    ).catch(() => {/* Ignore logging errors */});

    // Return successful result
    return {
      success: true,
      strategy_id: strategyId,
      execution_id: data.execution_id,
      status: 'completed',
      execution_time: data.execution_time,
      plugins_executed: data.plugins_executed,
      successful_plugins: data.successful_plugins,
      xp_earned: data.xp_earned
    };
  } catch (error: any) {
    // Handle unexpected errors
    console.error('Unexpected error executing strategy:', error);

    try {
      await logSystemEvent(
        'strategy',
        'error',
        {
          strategy_id: strategyId,
          error: error.message || 'Unexpected error',
          status: 'failed',
          tenant_id: tenantId,
          event_name: 'execute_strategy_error'
        },
        tenantId
      );
    } catch (logError) {
      console.warn('Failed to log strategy error:', logError);
    }

    return {
      success: false,
      error: `Unexpected error: ${error.message || 'Unknown error'}`,
      strategy_id: strategyId,
      status: 'failed'
    };
  }
}
