
import { runStrategy } from "@/lib/strategy/runStrategy";
import { ExecuteStrategyInput, ExecuteStrategyResult } from "@/lib/strategy/types";
import { recordExecution } from "@/lib/executions/recordExecution";

export default async function executeStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  try {
    // Record the execution start
    const executionId = await recordExecution({
      tenant_id: input.tenant_id || '',
      type: 'strategy',
      status: 'pending',
      strategy_id: input.strategy_id,
      executed_by: input.user_id,
      input: { strategy_id: input.strategy_id }
    });

    // Execute the strategy
    const result = await runStrategy(input);

    // Update the execution record on success
    if (result.success && executionId) {
      await recordExecution({
        tenant_id: input.tenant_id || '',
        type: 'strategy',
        status: 'success',
        strategy_id: input.strategy_id,
        executed_by: input.user_id,
        output: result.data,
        execution_time: performance.now(), // This would be more accurate with a start time
        xp_earned: 25 // Default XP for successful execution
      });
    }

    return result;
  } catch (error: any) {
    // Record the execution failure
    if (input.tenant_id) {
      await recordExecution({
        tenant_id: input.tenant_id,
        type: 'strategy',
        status: 'failure',
        strategy_id: input.strategy_id,
        executed_by: input.user_id,
        error: error.message || 'Unknown error occurred',
        execution_time: 0
      });
    }

    return {
      success: false,
      error: error.message || 'An unknown error occurred while executing the strategy'
    };
  }
}
