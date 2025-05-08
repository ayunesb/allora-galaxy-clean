
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
  executionId?: string;
  executionTime?: number;
  outputs?: Record<string, any>;
  results?: Record<string, any>;
  logs?: Array<any>;
}
