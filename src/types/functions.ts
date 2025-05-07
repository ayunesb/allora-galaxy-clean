
export interface ExecuteStrategyInput {
  strategy_id: string;
  tenant_id: string;
  user_id: string;
}

export interface UpdateKpisInput {
  tenant_id: string;
  run_mode?: 'manual' | 'cron';
}

export interface SyncMqlsInput {
  tenant_id: string;
  auth_token: string;
}

export interface WebhookAlertPayload {
  strategy_id: string;
  status: 'approved' | 'executed';
  plugin_ids: string[];
  tenant_id: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  strategy_id?: string;
  plugin_id?: string;
}

export interface PluginImpactInput {
  plugin_id: string;
  strategy_id?: string;
  tenant_id: string;
  status: 'success' | 'failure';
  output: Record<string, any>;
  xp_earned: number;
}

export interface AgentVoteInput {
  agent_version_id: string;
  vote_type: 'up' | 'down';
  user_id: string;
  comment?: string;
}

export interface LogEventInput {
  tenant_id: string;
  module: 'strategy' | 'plugin' | 'agent' | 'auth' | 'billing';
  event: string;
  context?: Record<string, any>;
}

export interface ExecutionRecordInput {
  tenant_id: string;
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  executed_by?: string;
  type: 'plugin' | 'agent' | 'strategy';
  status: 'success' | 'failure' | 'pending';
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  xp_earned?: number;
  execution_time?: number;
}

export interface FunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
