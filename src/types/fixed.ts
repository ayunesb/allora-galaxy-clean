
// Define the input interface for executing a strategy (camelCase version)
export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

// Define the result interface for a strategy execution (camelCase version)
export interface ExecuteStrategyResult {
  success: boolean;
  error?: string;
  strategy_id?: string; // Adding this to fix the errors
  execution_id?: string;
  execution_time?: number;
  outputs?: Record<string, any>;
  results?: Record<string, any>;
  logs?: Array<any>;
  status?: string;
  message?: string;
  plugins_executed?: number;
  successful_plugins?: number;
  xp_earned?: number;
  data?: any;
}
