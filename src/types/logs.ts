
// Define the LogModule as a union of string literals
export type LogModule = 
  | 'strategy' 
  | 'agent' 
  | 'plugin' 
  | 'auth' 
  | 'tenant' 
  | 'system' 
  | 'api'
  | 'edge'
  | 'cron'
  | 'webhook'
  | 'notification'
  | 'user'
  | 'billing'
  | 'test-module' // Added for testing purposes
  | string; // Allow string for dynamic modules and backward compatibility

export type LogLevel = 'error' | 'warning' | 'info' | 'debug';
export type LogSeverity = 'critical' | 'high' | 'medium' | 'low' | string;

export interface SystemLog {
  id: string;
  created_at: string;
  timestamp: string; 
  module: LogModule;
  level: LogLevel;
  event: string;
  event_type: string;
  description: string;
  message: string;
  tenant_id: string;
  context: Record<string, any>;
  severity?: LogSeverity;
  error_type?: string;
  error_message?: string;
  details?: Record<string, any>; // Added for LogDetailDialog
  user_id?: string;
  source?: string;
  request_id?: string;
  metadata?: Record<string, any>;
  priority?: string;
  user_facing?: boolean;
  affects_multiple_users?: boolean;
}

export interface LogGroup {
  id: string;
  message: string;
  module: LogModule;
  first_seen: string;
  last_seen: string;
  count: number;
  level: LogLevel;
  severity: LogSeverity;
  resolved?: boolean;
  source?: string;
  tenants?: string[];
}

export interface ErrorTrendDataPoint {
  date: string;
  count: number; // Required by tests
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface LogsApiResponse {
  logs: SystemLog[];
  totalCount: number;
}

export interface LogsQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  level?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  tenantId?: string;
}

export interface LogFilterState {
  level: string;
  module: string;
  dateRange: [Date | null, Date | null];
  search: string;
}

export interface LogFilters {
  module?: LogModule | LogModule[];
  level?: LogLevel | LogLevel[];
  severity?: LogSeverity | LogSeverity[];
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
  query?: string;
  search?: string; // Added search property
  searchTerm?: string; // Alternative name used in some components
  resolved?: boolean;
  tenantId?: string;
  source?: string;
  error_type?: string | string[];
  tenant_id?: string;
  dateRange?: DateRange;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

// Utility functions to check log types
export function isLogLevel(value: string): value is LogLevel {
  return ['error', 'warning', 'info', 'debug'].includes(value);
}

export function isLogSeverity(value: string): value is LogSeverity {
  return ['critical', 'high', 'medium', 'low'].includes(value);
}

export function isSystemLog(log: any): log is SystemLog {
  return log && 
    typeof log.id === 'string' && 
    typeof log.module === 'string' &&
    (typeof log.level === 'string' || log.level === undefined);
}

export function hasError(log: SystemLog): boolean {
  return log.level === 'error' || !!log.error_message;
}
