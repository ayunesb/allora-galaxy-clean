
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

export interface PluginLog {
  id: string;
  plugin_id: string;
  status: 'success' | 'failure' | 'pending';
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
  success: boolean;
  plugin_id: string;
  output?: Record<string, any>;
  error?: string;
  log_id?: string;
  execution_time?: number;
  xp_earned?: number;
}

// Result of running a plugin chain
export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  totalXp: number;
  executionTime: number;
}
