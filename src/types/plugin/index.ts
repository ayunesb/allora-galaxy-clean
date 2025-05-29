export interface Plugin {
  id: string;
  name: string;
  description?: string;
  status: string;
  category?: string;
  icon?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  tenant_id?: string;
  roi?: number;
  xp?: number;
}

export interface PluginVersion {
  id: string;
  plugin_id: string;
  version: string;
  content: string;
  status: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  changes?: string[];
}

export interface PluginExecution {
  id: string;
  plugin_id: string;
  status: "success" | "failure" | "running" | "pending";
  start_time: string;
  end_time?: string;
  execution_time?: number;
  result?: any;
  error?: string;
  executed_by?: string;
  tenant_id?: string;
}

export interface PluginExecutionResult {
  success: boolean;
  pluginId?: string;
  executionId?: string;
  error?: string;
  status?: string;
}

export interface PluginInput {
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

export interface PluginResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface RunPluginChainResult {
  success: boolean;
  results: Record<string, PluginResult>;
  errors?: Record<string, string>;
}

// Add this for AgentVersionsTab component
export interface AgentVersion {
  id: string;
  plugin_id: string;
  prompt: string;
  status: string;
  version: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  upvotes?: number;
  downvotes?: number;
  xp?: number;
}

// Add this interface for scatter plot
export interface ScatterDataPoint {
  x: number;
  y: number;
  name?: string;
  id?: string;
  category?: string;
  size?: number;
}
