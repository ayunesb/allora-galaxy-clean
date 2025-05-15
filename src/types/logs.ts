
import { SystemEventModule } from './shared';

export type LogLevel = 'info' | 'warning' | 'error' | 'debug';
export type LogSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface LogFilters {
  search?: string;
  searchTerm?: string; // For backward compatibility
  level?: string;
  module?: string | SystemEventModule | SystemEventModule[];
  severity?: LogSeverity | string;
  fromDate?: string;
  toDate?: string;
  dateRange?: DateRange;
  tenant_id?: string;
}

export interface SystemLog {
  id: string;
  created_at: string;
  timestamp: string;
  module: string;
  level?: LogLevel;
  event: string;
  event_type?: string;
  description?: string;
  message?: string;
  tenant_id?: string;
  severity?: LogSeverity;
  error_type?: string;
  user_id?: string;
  context?: Record<string, any>;
  error_message?: string;
  details?: Record<string, any> | string;
  metadata?: Record<string, any>;
  request_id?: string;
  priority?: string;
  user_facing?: boolean;
  affects_multiple_users?: boolean;
}

export interface LogGroup {
  id: string;
  message: string;
  modules?: string[];
  count: number;
  last_seen?: string;
  first_seen?: string;
  severity?: LogSeverity;
  error_type?: string;
}

export interface ErrorTrendDataPoint {
  date: string;
  count: number;
  severity?: LogSeverity;
  module?: string;
  trend?: number;
}

export const isLogSeverity = (value: string): value is LogSeverity => {
  return ['low', 'medium', 'high', 'critical'].includes(value);
};

export const isLogLevel = (value: string): value is LogLevel => {
  return ['info', 'warning', 'error', 'debug'].includes(value);
};

export const isSystemLog = (value: any): value is SystemLog => {
  return typeof value === 'object' && 
    value !== null && 
    'id' in value && 
    'timestamp' in value && 
    'module' in value;
};

export const hasError = (log: SystemLog): boolean => {
  return (
    log.level === 'error' || 
    !!log.error_message || 
    !!log.error_type || 
    (log.severity === 'high' || log.severity === 'critical')
  );
};
