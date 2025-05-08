
/**
 * Type definitions for plugins
 */

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  category?: string;
  status: string;
  icon?: string;
  metadata?: Record<string, any>;
  xp?: number;
  roi?: number;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PluginResult {
  success: boolean;
  output: Record<string, any>;
  error?: string;
  executionTime: number;
  xpEarned: number;
}

export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  output: Record<string, any>;
  error?: string;
}

export interface PluginExecutionParams {
  tenant_id: string;
  user_id?: string;
  strategy_id?: string;
  execution_id?: string;
  options?: Record<string, any>;
}

export interface PluginLogEntry {
  id: string;
  plugin_id: string;
  agent_version_id?: string;
  strategy_id?: string;
  tenant_id: string;
  status: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  execution_time: number;
  xp_earned: number;
  created_at: string;
}
