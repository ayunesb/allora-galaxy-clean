
import { SystemEventModule } from './shared';

export interface SystemLog {
  id: string;
  module: SystemEventModule;
  event: string;
  context: any;
  created_at: string;
  tenant_id?: string;
  level?: 'info' | 'warning' | 'error'; // Added the level field needed by components
  description?: string; // Added the description field needed by components
}

export interface AuditLog {
  id: string;
  module: SystemEventModule;
  event: string;
  context: any;
  created_at: string;
  tenant_id?: string;
  user_id?: string;
  entity_id?: string;
  entity_type?: string;
  action?: string; // Added the action field needed by components
  description?: string; // Added the description field needed by components
}

export interface PluginLog {
  id: string;
  plugin_id: string;
  strategy_id?: string;
  agent_version_id?: string;
  tenant_id: string;
  status: string;
  input: any;
  output: any;
  error?: string;
  created_at: string;
  execution_time: number;
  xp_earned: number;
  event: string;
  metadata?: any;
  plugins?: { name: string };
  strategies?: { title: string };
}

export interface ExecutionLog {
  id: string;
  type: string;
  status: string;
  tenant_id: string;
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  executed_by?: string;
  input?: any;
  output?: any;
  error?: string;
  created_at: string;
  execution_time: number;
  xp_earned: number;
  agent_versions?: {
    id: string;
    version: string;
    prompt: string;
    plugin_id: string;
    plugins: {
      name: string;
    };
  };
}
