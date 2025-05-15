
/**
 * Plugin-related type definitions
 */

/**
 * Represents a plugin in the system
 */
export interface Plugin {
  /** Unique identifier */
  id: string;
  
  /** Plugin display name */
  name: string;
  
  /** Plugin description */
  description?: string;
  
  /** Current status */
  status: 'active' | 'inactive' | 'deprecated' | 'beta' | string;
  
  /** Plugin category */
  category?: string;
  
  /** Icon identifier */
  icon?: string;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
  
  /** Tenant ID */
  tenant_id?: string;
  
  /** Creation timestamp */
  created_at?: string;
  
  /** Last update timestamp */
  updated_at?: string;
  
  /** Experience points */
  xp?: number;
  
  /** Return on investment score */
  roi?: number;
}

/**
 * Result of a plugin execution
 */
export interface PluginResult {
  /** Whether execution was successful */
  success: boolean;
  
  /** Data returned from plugin */
  data?: any;
  
  /** Error information if unsuccessful */
  error?: string;
  
  /** Execution metadata */
  metadata?: Record<string, any>;
}

/**
 * Result of running a plugin chain
 */
export interface RunPluginChainResult {
  /** Overall success status */
  success: boolean;
  
  /** Individual plugin results */
  results: PluginResult[];
  
  /** Combined data from all plugins */
  data?: Record<string, any>;
  
  /** Error information if unsuccessful */
  error?: string;
}
