
export interface Plugin {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  status: string;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  xp?: number;
  roi?: number;
}

export interface AgentVersion {
  id: string;
  plugin_id: string;
  version: string;
  prompt: string;
  status: string;
  created_at?: string;
  created_by?: string;
  upvotes?: number;
  downvotes?: number;
  xp?: number;
}

export interface PluginLog {
  id: string;
  tenant_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  strategy_id?: string;
  status: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  execution_time?: number;
  xp_earned?: number;
  created_at?: string;
}

export interface PluginResult {
  plugin_id: string;
  success: boolean;
  status: 'success' | 'failure' | 'pending';
  output: any;
  error?: string;
  executionTime: number;
  xpEarned: number;
}

export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  output?: Record<string, any>;
  error?: string;
}
