/**
 * Strategy execution types
 */

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface ExecuteStrategyParams {
  tenant_id: string;
  strategy_id: string;
  user_id?: string;
  options?: {
    dryRun?: boolean;
    force?: boolean;
    timeout?: number;
  };
}

export type StrategyExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "aborted";

export interface StrategyExecutionResult {
  success: boolean;
  strategy_id: string;
  execution_id?: string;
  status: StrategyExecutionStatus;
  message?: string;
  errors?: string[];
  warnings?: string[];
  execution_time_ms?: number;
  plugins_executed?: number;
  successful_plugins?: number;
  xp_earned?: number;
  data?: Record<string, any>;
  error?: string;
  execution_time?: number;
  outputs?: any;
  results?: any;
  logs?: any;
}

export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

// Type for strategy execution response
export interface ExecuteStrategyResult extends StrategyExecutionResult {
  // Additional fields can be added here
}
