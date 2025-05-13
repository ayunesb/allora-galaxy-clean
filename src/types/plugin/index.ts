
// Define the core plugin types with all needed fields

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'deprecated';
  type: 'action' | 'integration' | 'analytics' | 'other';
  config?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  tenant_id?: string;
  created_by?: string;
  xp?: number;
  dependencies?: string[];
  roi?: number;
  category?: string;
  icon?: string;
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

export interface PluginConfig {
  enabled: boolean;
  settings: Record<string, any>;
  credentials?: Record<string, string>;
  id?: string;
  name?: string;
  description?: string;
  version?: string;
  parameters?: Record<string, any>;
}

export interface PluginExecutionOptions {
  timeout?: number;
  retry?: boolean;
  maxRetries?: number;
  backoffStrategy?: 'linear' | 'exponential';
  trackXp?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface PluginResult {
  success: boolean;
  pluginId?: string;
  status?: string;
  output?: any;
  error?: string;
  executionTime?: number;
  xpEarned?: number;
  data?: any;
}

export interface RunPluginChainResult {
  success: boolean;
  results?: PluginResult[];
  data?: Record<string, any>;
  errors?: Record<string, string>;
  executionTime?: number;
  xpEarned?: number;
  error?: string;
}
