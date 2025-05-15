
import type { SystemEventModule } from './shared';

export interface SystemLog {
  id: string;
  tenant_id: string;
  level: 'info' | 'warning' | 'error';
  module: SystemEventModule;
  message: string;
  details?: Record<string, any>;
  created_at: string;
  user_id?: string;
  status?: 'success' | 'failure' | 'pending';
}

export interface PluginLog {
  id: string;
  tenant_id: string;
  plugin_id: string;
  execution_id: string;
  status: string;
  xp_earned: number;
  context: Record<string, any>;
  created_at: string;
  agent_version_id?: string;
}

export interface LogGroup {
  id: string;
  message: string;
  level: string;
  module: string;
  count: number;
  first_seen: string;
  last_seen: string;
}

export interface LogFilters {
  level?: string;
  module?: string;
  tenant_id?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  status?: string;
}

export interface LogsResponse {
  data: SystemLog[];
  count: number;
}

export interface LogGroupsResponse {
  data: LogGroup[];
  count: number;
}
