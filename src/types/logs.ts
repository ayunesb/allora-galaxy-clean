
// Define the system log entry type
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  module: string;
  tenant_id?: string;
  user_id?: string;
  details?: any;
  metadata?: Record<string, any>;
  context?: string | Record<string, any>; // Update to accept both string and object
  trace_id?: string;
  request_id?: string;
  component?: string;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'warning'; // Add 'warning' for compatibility
export type LogSeverity = 'low' | 'medium' | 'high' | 'critical';

// Helper functions for type checking
export const isLogLevel = (value: string): value is LogLevel => {
  return ['info', 'warn', 'error', 'debug', 'warning'].includes(value);
};

export const isLogSeverity = (value: string): value is LogSeverity => {
  return ['low', 'medium', 'high', 'critical'].includes(value);
};

export interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  module: string;
  tenant_id?: string;
  user_id?: string;
  details?: Record<string, any>;
  source?: string;
  // Additional fields for test compatibility
  created_at?: string;
  event?: string;
  event_type?: string;
  description?: string;
  context?: string | Record<string, any>; // Update to accept both string and object
  error_type?: string;
  severity?: LogSeverity;
  error_message?: string;
  user_facing?: boolean;
  affects_multiple_users?: boolean;
}

// Helper function to check if a log has an error
export const hasError = (log: SystemLog): boolean => {
  return log.level === 'error' || !!log.error_message;
};

// Check if a value is a SystemLog
export const isSystemLog = (value: any): value is SystemLog => {
  return (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'timestamp' in value &&
    'level' in value &&
    'message' in value
  );
};

export interface LogFilters {
  level?: string[];
  module?: string[];
  tenant?: string[];
  tenant_id?: string;
  dateRange?: DateRange;
  search?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
  error_type?: string[];
  severity?: string[];
}

export interface DateRange {
  from: Date;
  to?: Date;
}

export interface LogsQueryParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: LogFilters;
}

export interface LogsResponse {
  logs: SystemLog[];
  total: number;
  page: number;
  pageSize: number;
}

// Update ErrorTrendDataPoint for chart components
export interface ErrorTrendDataPoint {
  date: string;
  count: number;
  level?: LogLevel;
  severity?: LogSeverity;
  module?: string;
  errorType?: string;
  // Add these properties for chart compatibility
  total?: number;
  critical?: number;
  high?: number;
  medium?: number;
  low?: number;
}

export interface ErrorDistributionData {
  name: string;
  value: number;
  percentage?: number;
}

export interface ErrorSummary {
  totalErrors: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  byModule: ErrorDistributionData[];
  byType: ErrorDistributionData[];
  trend: ErrorTrendDataPoint[];
  recentErrors: SystemLog[];
}
