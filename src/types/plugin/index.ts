
// Re-export all plugin-related types for consistent imports
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
}

export interface PluginConfig {
  enabled: boolean;
  settings: Record<string, any>;
  credentials?: Record<string, string>;
}

export interface PluginExecutionOptions {
  timeout?: number;
  retry?: boolean;
  maxRetries?: number;
  backoffStrategy?: 'linear' | 'exponential';
  trackXp?: boolean;
}

export interface PluginResult {
  pluginId: string;
  success: boolean;
  output?: any;
  error?: string;
  executionTime?: number;
  xpEarned?: number;
}

export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  error?: string;
}
