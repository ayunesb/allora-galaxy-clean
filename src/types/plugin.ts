
import { BaseEntity } from "./shared";

export interface Plugin extends BaseEntity {
  name: string;
  description?: string;
  icon?: string;
  status: string;
  tenant_id?: string;
  category?: string;
  xp?: number;
  roi?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface PluginLog {
  id: string;
  plugin_id?: string;
  strategy_id?: string;
  agent_version_id?: string;
  tenant_id?: string;
  status: string;
  error?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  execution_time?: number;
  xp_earned?: number;
  created_at?: string;
}

export interface EnhancedPlugin extends Plugin {
  trend_score?: number;
}
