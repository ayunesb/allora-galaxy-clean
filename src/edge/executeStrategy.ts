
import { supabase } from '@/integrations/supabase/client';
import { ExecuteStrategyInputSnakeCase, ExecuteStrategyResult } from '@/types/fixed';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Execute a strategy with the given inputs
 * @param input The strategy execution parameters
 * @returns The result of the execution
 */
export async function executeStrategy(input: ExecuteStrategyInputSnakeCase): Promise<ExecuteStrategyResult> {
  try {
    // Validate input
    if (!input.strategy_id) {
      return {
        success: false,
        error: 'Strategy ID is required',
        execution_time: 0,
        strategy_id: '',
        status: 'failed'
      };
    }
    
    if (!input.tenant_id) {
      return {
        success: false,
        error: 'Tenant ID is required',
        execution_time: 0,
        strategy_id: input.strategy_id,
        status: 'failed'
      };
    }
    
    // Execute the strategy via Supabase edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: input
    });
    
    if (error) {
      throw new Error(`Error executing strategy: ${error.message}`);
    }
    
    // Log the execution
    await logSystemEvent(
      'strategy',
      'info',
      {
        event_type: 'strategy_executed',
        strategy_id: input.strategy_id,
        tenant_id: input.tenant_id,
        user_id: input.user_id,
        success: data.success
      },
      input.tenant_id
    );
    
    return {
      success: data.success,
      strategy_id: input.strategy_id,
      status: data.success ? 'completed' : 'failed',
      execution_time: data.execution_time || 0,
      execution_id: data.execution_id,
      error: data.error,
      details: data.details
    };
  } catch (error: any) {
    // Log the error
    try {
      await logSystemEvent(
        'strategy',
        'error',
        {
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
      strategy_id: input.strategy_id,
      status: 'failed',
      execution_time: 0,
      error: error.message
    };
  }
}
