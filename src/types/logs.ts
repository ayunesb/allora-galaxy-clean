
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
  description?: string;
  timestamp?: string;
  error_type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  context?: string;
  user_facing?: boolean;
  affects_multiple_users?: boolean;
  metadata?: any;
  request_id?: string;
  error_message?: string;
  event?: string;
  event_type?: string;
  priority?: string;
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
  level?: string | string[];
  module?: string | string[] | SystemEventModule | null;
  tenant_id?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  searchTerm?: string; // Keeping for backward compatibility
  status?: string | string[];
  fromDate?: string; // Added for compatibility
  toDate?: string; // Added for compatibility
  error_type?: string | string[];
  severity?: string | string[];
  dateFrom?: string | null; // Added for compatibility
  dateTo?: string | null; // Added for compatibility
}

export interface LogsResponse {
  data: SystemLog[];
  count: number;
}

export interface LogGroupsResponse {
  data: LogGroup[];
  count: number;
}
