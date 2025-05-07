
export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: Record<string, any>;
  execution_time?: number;
  execution_id?: string | null;
}
