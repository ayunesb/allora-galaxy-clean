
import { ExecuteStrategyResult, StrategyExecutionStatus } from '@/lib/strategy/types';

interface StrategyExecutionResponse {
  success: boolean;
  strategy_id?: string; // Make this optional since responses might not include it
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
    strategy_id: response.strategy_id || '',  // Default to empty string if not provided
    execution_id: response.execution_id,
    status: response.status,
    error: response.error,
    execution_time: response.execution_time_ms ? response.execution_time_ms / 1000 : undefined,
    plugins_executed: response.plugins_executed,
    successful_plugins: response.successful_plugins,
    xp_earned: response.xp_earned,
    outputs: response.data
  };
}

// Default export for easier importing
export default processExecutionResponse;
