
// Plugin related types
export interface Plugin {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  tags?: string[];
  status: 'active' | 'inactive' | 'draft' | 'deprecated' | string;
  xp?: number | null;
  roi?: number | null;
  author?: string;
  version?: string;
  created_at?: string | null;
  updated_at?: string | null;
  tenant_id?: string;
}

export interface PluginLog {
  id: string;
  plugin_id: string | null;
  strategy_id?: string | null;
  agent_version_id?: string | null;
  tenant_id?: string | null;
  status?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string | null;
  xp_earned?: number | null;
  execution_time?: number | null;
  created_at: string;
  created_by?: string | null;
}

export interface AgentVersion {
  id: string;
  plugin_id: string;
  version: string;
  prompt: string;
  status: string;
  xp: number;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  tenant_id?: string;
}

export interface PluginResult {
  success: boolean;
  data?: any;
  error?: string;
  meta?: Record<string, any>;
}

export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  error?: string;
}
