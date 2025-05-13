
export interface StrategyInput {
  id: string;
  tenant_id: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

export interface StrategyExecutionResponse {
  success: boolean;
  strategy_id: string;
  execution_id?: string;
  error?: string;
  result?: any;
  plugins_used?: number;
  execution_time?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface StrategyVerificationResult {
  valid: boolean;
  errors: string[];
  strategy?: any;
}

// Re-export for backward compatibility
export type StrategyExecutionResult = StrategyExecutionResponse;
