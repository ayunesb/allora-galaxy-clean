
// Types for the execution module

export interface ExecutionRecord {
  id: string;
  tenantId: string;
  status: string;
  type: string;
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  executedBy?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  executionTime?: number;
  xpEarned?: number;
  error?: string;
  createdAt: string;
}

export interface ExecutionFilter {
  tenantId: string;
  strategyId?: string;
  pluginId?: string;
  agentVersionId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ExecutionParams {
  tenant_id: string;
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  user_id?: string;
  options?: Record<string, any>;
}

export interface ExecutionResult {
  success: boolean;
  execution_id?: string;
  status: string;
  error?: string;
  execution_time?: number;
  xp_earned?: number;
  output?: any;
}

export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id?: string;
  options?: Record<string, any>;
}

export interface ExecuteStrategyOptions {
  dry_run?: boolean;
  debug?: boolean;
  max_plugins?: number;
  timeout?: number;
  include_details?: boolean;
}
