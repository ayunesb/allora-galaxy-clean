
// Types for the execution system

export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyInputSnakeCase {
  strategy_id: string;
  tenant_id: string;
  user_id: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyResult {
  success: boolean;
  executionId?: string;
  executionTime: number;
  status: string;
  error?: string;
  pluginsExecuted?: number;
  successfulPlugins?: number;
  xpEarned?: number;
  outputs?: Record<string, any>;
  results?: Record<string, any>;
  logs?: Array<any>;
}

export interface ExecutionRecord {
  id: string;
  strategy_id: string;
  tenant_id: string;
  user_id: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'partial_success';
  started_at: string;
  completed_at?: string;
  execution_time?: number;
  plugins_executed?: number;
  successful_plugins?: number;
  xp_earned?: number;
  outputs?: Record<string, any>;
  results?: Record<string, any>;
  logs?: Array<any>;
}
