
// Execution related types
export interface Execution {
  id: string;
  tenant_id: string;
  type: string;
  status: 'success' | 'failure' | 'pending';
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  executed_by?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  created_at: string;
  execution_time: number;
  xp_earned: number;
}

export interface ExecutionParams {
  tenant_id: string;
  strategy_id?: string;
  user_id?: string;
  options?: Record<string, any>;
}

export type ExecutionType = 'strategy' | 'plugin' | 'agent' | 'test' | 'system';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
  tenant_id: string;
}
