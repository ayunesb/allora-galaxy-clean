
// Plugin and agent related types
import { User } from './user';

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'deprecated';
  xp: number;
  roi: number;
  created_at: string;
  updated_at: string;
  icon?: string;
  category?: string;
  tenant_id: string;
  metadata?: Record<string, any>;
}

export interface AgentVersion {
  id: string;
  plugin_id: string;
  version: string;
  prompt: string;
  status: 'active' | 'deprecated';
  xp: number;
  created_at: string;
  updated_at: string;
  created_by?: User;
  upvotes: number;
  downvotes: number;
}

export interface PluginLog {
  id: string;
  plugin_id: string;
  strategy_id?: string;
  agent_version_id?: string;
  tenant_id: string;
  status: 'success' | 'failure' | 'pending';
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  created_at: string;
  execution_time: number;
  xp_earned: number;
}
