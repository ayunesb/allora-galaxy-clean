
/**
 * Plugin entity interface
 */
export interface Plugin {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  status: 'active' | 'inactive' | 'deprecated';
  created_at?: string;
  updated_at?: string;
  xp: number;
  roi: number;
  tenant_id: string;
  metadata?: Record<string, any>;
}

/**
 * Plugin log entity interface
 */
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
  execution_time: number;
  xp_earned: number;
  created_at: string;
}

/**
 * Plugin execution result interface
 */
export interface PluginResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime?: number;
  xp?: number;
}
