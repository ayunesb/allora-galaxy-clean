
/**
 * Input parameters for executing a strategy
 */
export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string | null;
  options?: Record<string, any>;
}

/**
 * Result of strategy execution
 */
export interface ExecuteStrategyResult {
  success: boolean;
  strategy_id?: string;
  message?: string;
  error?: string;
  data?: any;
  execution_id?: string;
  execution_time?: number;
  plugins_executed?: number;
  successful_plugins?: number;
  xp_earned?: number;
  status?: 'success' | 'partial' | 'failure'; // Removed 'pending' to match fixed.ts
  // Below fields for test compatibility
  executionTime?: number;
  outputs?: Record<string, any>;
  logs?: any[];
}

/**
 * Result of input validation
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Plugin execution result
 */
export interface PluginExecutionResult {
  plugin_id: string;
  success: boolean;
  log_id?: string;
  xp_earned: number;
  error?: string;
}
