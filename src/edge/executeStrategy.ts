
import { ExecuteStrategyResult, StrategyExecutionStatus } from '@/lib/strategy/types';

interface StrategyExecutionResponse {
  success: boolean;
  execution_id?: string;
  status: StrategyExecutionStatus;
  message?: string;
  error?: string;
  execution_time_ms?: number;
  plugins_executed?: number;
  successful_plugins?: number;
  xp_earned?: number;
  data?: Record<string, any>;
}

/**
 * Process the response from the strategy execution edge function
 * @param response The response from the edge function
 * @returns Standardized execution result
 */
export function processExecutionResponse(response: StrategyExecutionResponse): ExecuteStrategyResult {
  return {
    success: response.success,
    executionId: response.execution_id,
    status: response.status,
    error: response.error,
    execution_time: response.execution_time_ms ? response.execution_time_ms / 1000 : undefined,
    pluginsExecuted: response.plugins_executed,
    successfulPlugins: response.successful_plugins,
    xpEarned: response.xp_earned,
    outputs: response.data
  };
}

export default processExecutionResponse;
