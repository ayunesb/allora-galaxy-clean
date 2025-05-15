
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
  last_seen: string; // Standardized property name for consistency
}

export interface LogFilters {
  level?: string | string[];
  module?: string | string[] | SystemEventModule | null;
  tenant_id?: string;
  startDate?: string; // Standard property
  endDate?: string; // Standard property
  search?: string; // Standard property for search terms
  searchTerm?: string; // Alias for search, kept for backward compatibility
  status?: string | string[];
  fromDate?: string; // Alias for startDate, kept for compatibility
  toDate?: string; // Alias for endDate, kept for compatibility
  error_type?: string | string[];
  severity?: string | string[];
  dateFrom?: string | null; // Another alias, kept for compatibility
  dateTo?: string | null; // Another alias, kept for compatibility
}

export interface LogsResponse {
  data: SystemLog[];
  count: number;
}

export interface LogGroupsResponse {
  data: LogGroup[];
  count: number;
}

export interface DateRange {
  from: Date;
  to?: Date;
}

// Type guard function to check if a property exists on a SystemLog
export function hasLogProperty<K extends keyof SystemLog>(
  log: SystemLog | undefined,
  prop: K
): log is SystemLog & { [key in K]: NonNullable<SystemLog[K]> } {
  return !!log && prop in log && log[prop] !== undefined && log[prop] !== null;
}

// Type guard for specific log severity
export function hasLogSeverity(
  log: SystemLog | undefined
): log is SystemLog & { severity: NonNullable<SystemLog['severity']> } {
  return !!log && !!log.severity;
}

// Convert possibly varied date formats to standardized dates
export function normalizeLogFilters(filters: LogFilters): LogFilters {
  const normalized: LogFilters = { ...filters };
  
  // Normalize date fields
  normalized.startDate = filters.startDate || filters.fromDate || filters.dateFrom || undefined;
  normalized.endDate = filters.endDate || filters.toDate || filters.dateTo || undefined;
  
  // Normalize search term
  normalized.search = filters.search || filters.searchTerm || undefined;
  
  return normalized;
}
