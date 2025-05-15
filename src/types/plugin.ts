
import { SystemLog, LogLevel, LogSeverity } from './logs';

/**
 * Plugin log interface for storing plugin execution logs
 */
export interface PluginLog extends Omit<SystemLog, 'plugin_id'> {
  /** ID of the plugin */
  plugin_id: string;
  
  /** Execution status */
  execution_status?: 'success' | 'error' | 'warning';
  
  /** Input parameters */
  input_params?: Record<string, any>;
  
  /** Output result */
  output_result?: Record<string, any>;
  
  /** Execution time in ms */
  execution_time?: number;
  
  /** Experience points earned */
  xp_earned?: number;
  
  /** Associated strategy ID */
  strategy_id?: string;
}

// Export this type specifically for use across the app
export type { PluginLog };
