
import { supabase } from '@/integrations/supabase/client';
import { validateInput } from './utils/validateInput';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/types/fixed';
import { logSystemEvent, logSystemError } from '@/lib/system/logSystemEvent';

/**
 * Executes a strategy via the edge function
 * @param input The strategy execution input
 * @returns Execution result
 */
export async function runStrategy(
  input: ExecuteStrategyInput | undefined
): Promise<ExecuteStrategyResult> {
  try {
    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors?.[0] || 'Invalid input',
        executionTime: 0,
        status: 'error'
      };
    }

    // Log start of execution
    try {
      await logSystemEvent(
        'strategy',
        'info',
        `Starting strategy execution for ${input.strategyId}`,
        input.tenantId
      );
    } catch (logError) {
      console.error('Failed to log execution start:', logError);
      // Continue execution despite logging error
    }

    // Convert to snake_case for API
    const snakeCaseInput = {
      strategy_id: input.strategyId,
      tenant_id: input.tenantId,
      user_id: input.userId,
      options: input.options
    };

    // Execute strategy using edge function
    const { data, error } = await supabase.functions.invoke('executeStrategy', {
      body: snakeCaseInput
    });

    if (error) {
      console.error('Error executing strategy:', error);
      
      try {
        await logSystemError(
          'strategy', 
          error,
          { strategyId: input.strategyId },
          input.tenantId
        );
      } catch (logError) {
        console.error('Failed to log execution error:', logError);
      }
      
      return {
        success: false,
        error: error.message || 'Failed to execute strategy',
        executionTime: 0,
        status: 'error'
      };
    }

    // Process the response
    if (data.success) {
      return {
        success: true,
        executionId: data.execution_id,
        executionTime: data.execution_time || 0,
        status: data.status || 'success',
        pluginsExecuted: data.plugins_executed,
        successfulPlugins: data.successful_plugins,
        xpEarned: data.xp_earned,
        outputs: data.data
      };
    } else {
      return {
        success: false,
        error: data.error || 'Unknown error occurred',
        executionTime: data.execution_time || 0,
        status: 'failure'
      };
    }
  } catch (error: any) {
    console.error('Exception in runStrategy:', error);
    
    try {
      await logSystemError(
        'strategy',
        error,
        { strategyId: input?.strategyId },
        input?.tenantId
      );
    } catch (logError) {
      console.error('Failed to log exception:', logError);
    }
    
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      executionTime: 0,
      status: 'error'
    };
  }
}
