
/**
 * Types for strategy execution
 */

export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyInputSnakeCase {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyResult {
  success: boolean;
  executionId?: string;
  executionTime: number;
  status: 'success' | 'partial' | 'failure' | 'error' | string;
  error?: string;
  pluginsExecuted?: number;
  successfulPlugins?: number;
  xpEarned?: number;
  results?: any;
  outputs?: any;
  logs?: any[];
}

/**
 * Types for strategy execution options
 */
export interface StrategyExecutionOptions {
  dryRun?: boolean;
  debug?: boolean;
  context?: Record<string, any>;
  maxPlugins?: number;
  timeout?: number;
}

/**
 * Types for plugin execution
 */
export interface PluginExecutionResult {
  success: boolean;
  plugin_id: string;
  execution_time?: number;
  xp_earned?: number;
  output?: any;
  error?: string;
}

/**
 * Types for agent execution
 */
export interface AgentExecutionResult {
  success: boolean;
  agent_id: string;
  agent_version_id: string;
  execution_time?: number;
  xp_earned?: number;
  output?: any;
  error?: string;
}
