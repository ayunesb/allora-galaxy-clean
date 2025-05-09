
// Define fixed types used across the application

export interface ExecuteStrategyInputSnakeCase {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyResult {
  success: boolean;
  strategy_id: string;
  status: string;
  execution_time: number;
  error?: string;
  execution_id?: string;
  outputs?: Record<string, any>;
  logs?: Array<any>;
}
