
/**
 * Interface for plugin objects
 */
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
}

/**
 * Plugin configuration interface
 */
export interface PluginConfig {
  enabled: boolean;
  settings: Record<string, any>;
  credentials?: Record<string, string>;
}

/**
 * Plugin execution options
 */
export interface PluginExecutionOptions {
  timeout?: number;
  retry?: boolean;
  maxRetries?: number;
  backoffStrategy?: 'linear' | 'exponential';
  trackXp?: boolean;
}
