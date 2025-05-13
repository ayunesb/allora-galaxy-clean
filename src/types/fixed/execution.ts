
/**
 * Execution types for strategy and plugin execution
 */

/**
 * Input for executing a strategy (camelCase version)
 */
export interface ExecuteStrategyInput {
  strategyId: string;
  tenantId: string;
  userId?: string;
  options?: Record<string, any>;
}

/**
 * Input for executing a strategy (snake_case version for API compatibility)
 */
export interface ExecuteStrategyInputSnakeCase {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

/**
 * Result of a strategy execution
 */
export interface ExecuteStrategyResult {
  success: boolean;
  executionId?: string;
  executionTime: number;
  status: 'success' | 'partial' | 'failure' | 'error' | string;
  error?: string;
  pluginsExecuted?: number;
  successfulPlugins?: number;
  xpEarned?: number;
  results?: Record<string, any>;
  outputs?: Record<string, any>;
  logs?: Array<any>;
}

/**
 * Execution record from the database
 */
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

/**
 * Options for strategy execution
 */
export interface StrategyExecutionOptions {
  dryRun?: boolean;
  debug?: boolean;
  context?: Record<string, any>;
  maxPlugins?: number;
  timeout?: number;
}

/**
 * Input for creating an execution record
 */
export interface ExecutionRecordInput {
  tenantId: string;
  status: string;
  type: string;
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  executedBy?: string;
  input?: any;
  output?: any;
  executionTime?: number;
  xpEarned?: number;
  error?: string;
}

/**
 * Result of a plugin execution
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
 * Result of an agent execution
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
