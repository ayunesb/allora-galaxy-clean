
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
 * @returns Strategy execution result
 */
export async function runStrategy(input?: StrategyInput): Promise<StrategyExecutionResult> {
  try {
    // Validate required inputs
    if (!input) {
      return { success: false, error: 'Strategy ID is required' };
    }

    if (!input.strategyId) {
      return { success: false, error: 'Strategy ID is required' };
    }

    if (!input.tenantId) {
      return { success: false, error: 'Tenant ID is required' };
    }

    // Log strategy execution start
    await logSystemEvent(
      input.tenantId, 
      'strategy',
      'info',
      { 
        event_type: 'execute_strategy_started',
        strategy_id: input.strategyId 
      }
    ).catch(err => console.error('Error logging strategy start:', err));

    // Send strategy execution request to edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: {
        id: input.strategyId,
        tenant_id: input.tenantId,
        user_id: input.userId,
        options: input.options || {},
      }
    });

    // Handle errors from edge function
    if (error) {
      console.error('Strategy execution error:', error);
      
      await logSystemEvent(
        input.tenantId,
        'strategy',
        'error',
        {
          event_type: 'execute_strategy_error',
          strategy_id: input.strategyId,
          error: error.message || 'Unknown error'
        }
      ).catch(err => console.error('Error logging strategy error:', err));
      
      return {
        success: false,
        error: `Error executing strategy: ${error.message || 'Unknown error'}`,
      };
    }

    // Handle missing response data
    if (!data) {
      console.error('Strategy execution returned no data');
      
      await logSystemEvent(
        input.tenantId,
        'strategy',
        'error',
        {
          event_type: 'execute_strategy_error',
          strategy_id: input.strategyId,
          error: 'No data returned from execution'
        }
      ).catch(err => console.error('Error logging strategy error:', err));
      
      return {
        success: false,
        error: 'No data returned from strategy execution',
      };
    }

    // Log successful execution
    await logSystemEvent(
      input.tenantId,
      'strategy',
      'info',
      {
        event_type: 'execute_strategy_completed',
        strategy_id: input.strategyId,
        execution_id: data.execution_id,
        execution_time: data.execution_time
      }
    ).catch(err => console.error('Error logging strategy completion:', err));

    return {
      success: true,
      execution_id: data.execution_id,
      execution_time: data.execution_time,
      details: data.details || {}
    };
  } catch (err: any) {
    console.error('Unexpected error executing strategy:', err);
    
    if (input?.tenantId && input?.strategyId) {
      await logSystemEvent(
        input.tenantId,
        'strategy',
        'error',
        {
          event_type: 'execute_strategy_error',
          strategy_id: input.strategyId,
          error: err.message || 'Unexpected error'
        }
      ).catch(e => console.error('Error logging strategy error:', e));
    }
    
    return {
      success: false,
      error: `Unexpected error: ${err.message || 'Unknown error'}`,
      details: err.stack
    };
  }
}

// Exported for testing
export const _testing = {
  runStrategy
};
