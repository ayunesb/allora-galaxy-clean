
import { Json } from "@/integrations/supabase/types";

/**
 * Result object for a single plugin execution
 */
export interface PluginResult {
  plugin_id: string;
  name: string;
  status: 'success' | 'failure' | 'skipped';
  execution_time: number;
  error?: string;
  output?: Record<string, any>;
  xp_earned: number;
}

/**
 * Result object for running a complete plugin chain
 */
export interface RunPluginChainResult {
  strategy_id: string;
  success: boolean;
  results: PluginResult[];
  total_execution_time: number;
  total_plugins_run: number;
  successful_plugins: number;
  failed_plugins: number;
}
