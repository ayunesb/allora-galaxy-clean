
// Define types for plugin execution

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  xp: number;
  roi: number;
  tenant_id?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface PluginConfig {
  id: string;
  name: string;
  description?: string;
  version?: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  options?: Record<string, any>;
}

export interface PluginExecutionOptions {
  dryRun?: boolean;
  timeout?: number;
  retries?: number;
  context?: Record<string, any>;
}

export interface PluginResult {
  success: boolean;
  error?: string;
  data?: any;
  logs?: string[];
  executionTime?: number;
  status?: string; // Added status field
}

export interface ExecutePluginChainOptions {
  plugins: PluginConfig[];
  inputs: Record<string, any>;
  tenant_id: string;
  strategy_id?: string;
  options?: PluginExecutionOptions;
}

export interface ExecutePluginResult extends PluginResult {
  chainResults?: PluginResult[];
}

export interface RunPluginChainResult {
  success: boolean;
  results: PluginResult[];
  executionTime: number;
  error?: string;
}
