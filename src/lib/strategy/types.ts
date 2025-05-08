
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
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'aborted';

export interface StrategyExecutionResult {
  success: boolean;
  strategy_id: string;
  execution_id?: string;
  status: StrategyExecutionStatus;
  message?: string;
  errors?: string[];
  warnings?: string[];
  execution_time_ms?: number;
}
