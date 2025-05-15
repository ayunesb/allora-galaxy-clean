
export type LogLevel = 'info' | 'warning' | 'error';
export type LogSeverity = 'low' | 'medium' | 'high' | 'critical';
export type LogPriority = LogSeverity; // Alias for backward compatibility

export interface LogFilters {
  level?: LogLevel | LogLevel[];
  module?: string | string[];
  tenant_id?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
  startDate?: string | Date; // Alias for fromDate
  endDate?: string | Date;   // Alias for toDate
  dateFrom?: string | Date;  // Another alias for fromDate
  dateTo?: string | Date;    // Another alias for toDate
  search?: string;
  searchTerm?: string;       // Alias for search
  error_type?: string | string[];
  severity?: LogSeverity | LogSeverity[];
  user_id?: string;
  request_id?: string;
  date_range?: { from: Date; to?: Date };
  dateRange?: { from: Date; to?: Date }; // Alias for date_range
}

export interface SystemLog {
  id: string;
  created_at: string;
  timestamp: string;
  description: string;
  message: string;
  level: LogLevel;
  module: string;
  tenant_id: string;
  user_id?: string;
  metadata?: Record<string, any>;
  request_id?: string;
  error_type?: string;
  severity: LogSeverity;
  priority: LogPriority;
  error_message?: string;
  event: string;
  event_type: string;
  context: Record<string, any>;
  user_facing: boolean;
  affects_multiple_users: boolean;
  // Additional fields to ensure compatibility
  date?: string;
  time?: string;
  status?: string;
  type?: string;
}

export interface ExecutionLogItem {
  id: string;
  created_at: string;
  message: string;
  level: LogLevel;
  metadata?: Record<string, any>;
  // Additional properties specific to execution logs
  execution_id?: string;
  step?: string;
  duration_ms?: number;
  status?: 'success' | 'failed' | 'pending';
}

export interface LogGroup {
  id: string;
  name: string;
  count: number;
  first_seen: string;
  last_seen: string;
  level: LogLevel;
  severity: LogSeverity;
  error_type?: string;
  affects_users: number;
  is_resolved: boolean;
}

export interface LogDetail {
  log: SystemLog;
  related_logs?: SystemLog[];
  affected_users_count?: number;
  first_occurrence?: string;
  resolution_status?: 'resolved' | 'investigating' | 'ignored';
  assigned_to?: string;
  comments?: LogComment[];
}

export interface LogComment {
  id: string;
  created_at: string;
  user_id: string;
  user_name: string;
  content: string;
}

export interface LogStatistics {
  total: number;
  by_level: Record<LogLevel, number>;
  by_module: Record<string, number>;
  by_severity: Record<LogSeverity, number>;
  error_rate: number;
  user_facing_errors: number;
}

export interface DateRange {
  from: Date;
  to?: Date;
}
