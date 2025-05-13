
export interface Plugin {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  status: 'active' | 'inactive' | 'deprecated';
  xp?: number;
  roi?: number;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface PluginLog {
  id: string;
  plugin_id?: string;
  tenant_id?: string;
  strategy_id?: string;
  agent_version_id?: string;
  status: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  execution_time?: number;
  xp_earned?: number;
  created_at?: string;
}

export interface PluginResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
  xpEarned?: number;
}

export interface RunPluginChainResult {
  success: boolean;
  data: Record<string, any>;
  errors?: Record<string, string>;
  executionTime: number;
  xpEarned: number;
}
