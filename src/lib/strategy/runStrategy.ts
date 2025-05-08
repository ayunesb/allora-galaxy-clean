
import { recordExecution } from '@/lib/plugins/execution/recordExecution';
import { ExecuteStrategyResult } from '@/types/strategy';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { validateStrategyInput } from './utils/validateInput';
import { verifyStrategy } from './utils/verifyStrategy';
import { fetchPlugins } from './utils/fetchPlugins';
import { executePlugins } from './utils/executePlugins';
import { updateStrategyProgress } from './utils/updateStrategyProgress';

interface StrategyRunInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

/**
 * Main function to run a strategy and execute its associated plugins
 */
export async function runStrategy(input: StrategyRunInput): Promise<ExecuteStrategyResult> {
  const startTime = performance.now();
  const executionId = crypto.randomUUID();
  
  try {
    // 1. Validate input
    const validation = validateStrategyInput(input);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid input");
    }
    
    // 2. Record execution start
    await recordExecution({
      id: executionId,
      tenantId: input.tenantId,
      strategyId: input.strategyId,
      executedBy: input.userId || undefined,
      type: 'strategy',
      status: 'pending',
      input: input.options || {}
    });
    
    // 3. Verify strategy exists and belongs to tenant
    const { strategy, error: strategyError } = await verifyStrategy(input.strategyId, input.tenantId);
    if (strategyError) {
      throw new Error(strategyError);
    }
    
    // 4. Fetch plugins to execute
    const { plugins, error: pluginsError } = await fetchPlugins(input.strategyId, input.tenantId);
    if (pluginsError) {
      throw new Error(pluginsError);
    }
    
    // 5. Execute plugins
    const { 
      results: pluginResults, 
      xpEarned, 
      successfulPlugins,
      status
    } = await executePlugins(plugins || [], input.strategyId, input.tenantId, input.options);
    
    const executionTime = (performance.now() - startTime) / 1000;
    
    // 6. Record execution completion
    await recordExecution({
      id: executionId,
      tenantId: input.tenantId,
      type: 'strategy',
      status: status as 'success' | 'failure' | 'pending',
      output: { plugins: pluginResults },
      executionTime
    });
    
    // 7. Update strategy progress if execution was successful
    if (status === 'success' || status === 'partial') {
      await updateStrategyProgress(
        input.strategyId, 
        input.tenantId,
        status,
        strategy?.completion_percentage || 0
      );
    }
    
    // 8. Log system event
    await logSystemEvent(
      input.tenantId,
      'strategy',
      'strategy_executed',
      {
        strategy_id: input.strategyId,
        execution_id: executionId,
        status,
        plugins_executed: plugins?.length || 0,
        successful_plugins: successfulPlugins,
        xp_earned: xpEarned
      }
    );
    
    // 9. Return result
    return {
      success: status !== 'failure',
      strategy_id: input.strategyId,
      execution_id: executionId,
      status,
      message: `Strategy execution ${status}`,
      execution_time: executionTime,
      plugins_executed: plugins?.length || 0,
      successful_plugins: successfulPlugins,
      xp_earned: xpEarned,
      data: { plugins: pluginResults }
    };
    
  } catch (error: any) {
    console.error("Strategy execution error:", error);
    
    // Record execution failure
    try {
      await recordExecution({
        id: executionId,
        tenantId: input.tenantId,
        strategyId: input.strategyId,
        type: 'strategy',
        status: 'failure',
        error: error.message,
        executionTime: (performance.now() - startTime) / 1000
      });
    } catch (e) {
      console.error("Error recording execution failure:", e);
    }
    
    // Log system event for error
    try {
      await logSystemEvent(
        input.tenantId,
        'strategy',
        'strategy_execution_failed',
        {
          strategy_id: input.strategyId,
          execution_id: executionId,
          error: error.message
        }
      );
    } catch (e) {
      console.error("Error logging system event:", e);
    }
    
    // Return error result
    return {
      success: false,
      strategy_id: input.strategyId,
      execution_id: executionId,
      error: error.message,
      execution_time: (performance.now() - startTime) / 1000
    };
  }
}
