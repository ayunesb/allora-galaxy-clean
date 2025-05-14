
import { VoteType, DateRange } from './shared';

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
  status?: string;
  details?: any;
  xpEarned?: number;
  pluginsExecuted?: number;
  successfulPlugins?: number;
}

// Define snake case versions for edge functions
export interface ExecuteStrategyInputSnakeCase {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyResultSnakeCase {
  success: boolean;
  error?: string;
  execution_id?: string;
  execution_time?: number;
  outputs?: Record<string, any>;
  results?: Record<string, any>;
  logs?: Array<any>;
  status?: string;
  details?: any;
  xp_earned?: number;
  plugins_executed?: number;
  successful_plugins?: number;
}

// Export DateRange type from shared.ts
export { DateRange };

// Export standardized VoteType from shared.ts
export { VoteType };
