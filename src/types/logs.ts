
export type LogModule =
  | 'system'
  | 'auth'
  | 'billing'
  | 'plugin'
  | 'strategy'
  | 'agent'
  | 'tenant'
  | 'user'
  | 'notification'
  | 'api';

export type LogSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'debug' | string;

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface SystemLog {
  id: string;
  tenant_id: string;
  module: LogModule;
  timestamp: string;
  level: LogLevel;
  severity?: LogSeverity;
  message: string;
  details?: Record<string, any>; // Add the details property
  context?: Record<string, any>;
  user_id?: string;
  source?: string;
  trace_id?: string;
  metadata?: Record<string, any>;
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
  sources?: string[];
  tenants?: string[];
}

export interface ErrorTrendDataPoint {
  date: string;
  count: number;
  total: number; // Add properties used in tests
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export type LogSeverityCounts = Record<LogSeverity, number>;
export type LogModuleCounts = Record<LogModule, number>;

export interface LogFilters {
  module?: LogModule;
  level?: LogLevel;
  severity?: LogSeverity;
  startDate?: string;
  endDate?: string;
  query?: string;
  resolved?: boolean;
  tenantId?: string;
  source?: string;
}
