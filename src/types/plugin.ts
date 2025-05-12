
// Plugin related types
export interface Plugin {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  icon?: string;
  category?: string;
  tenant_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  xp?: number;
  roi?: number;
}

// Plugin log status - include 'error' as a valid status
export type PluginLogStatus = 'success' | 'failure' | 'pending' | 'error';

export interface PluginLog {
  id: string;
  plugin_id: string;
  status: PluginLogStatus;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  created_at: string;
  execution_time?: number;
  xp_earned?: number;
  tenant_id?: string;
  strategy_id?: string;
  agent_version_id?: string;
}

// Plugin result type for execution results
export interface PluginResult {
  plugin_id: string;
  success: boolean;
  status: PluginLogStatus;
  output?: Record<string, any>;
  error?: string;
  execution_time?: number;
  xp_earned?: number;
}

// Agent version type
export interface AgentVersion {
  id: string;
  version: string;
  plugin_id: string;
  prompt: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

// Result of running a plugin chain
export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  output?: Record<string, any>;
  error?: string;
}
