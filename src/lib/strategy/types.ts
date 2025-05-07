
export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id?: string;
  user_id?: string;
}

export interface ExecuteStrategyResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}
