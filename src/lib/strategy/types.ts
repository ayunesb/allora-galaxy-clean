
export type StrategyExecutionStatus = 'pending' | 'success' | 'partial' | 'failure';

export interface ExecuteStrategyResult {
  success: boolean;
  strategy_id: string;
  execution_id?: string;
  status: StrategyExecutionStatus;
  error?: string;
  execution_time?: number;
  plugins_executed?: number;
  successful_plugins?: number;
  xp_earned?: number;
  outputs?: Record<string, any>;
}

export interface StrategyExecutionResponse {
  success: boolean;
  strategy_id?: string;
  execution_id?: string;
  status: StrategyExecutionStatus;
  error?: string;
  execution_time_ms?: number;
  plugins_executed?: number;
  successful_plugins?: number;
  xp_earned?: number;
  data?: Record<string, any>;
}
