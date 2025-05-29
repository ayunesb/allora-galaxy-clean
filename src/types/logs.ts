/**
 * Represents the severity level of a log entry
 * Used to categorize logs by their importance
 */
export type LogLevel = "info" | "warning" | "error" | "debug";

/**
 * Represents the business impact severity of a log event
 * Used for prioritization and alerting
 */
export type LogSeverity = "low" | "medium" | "high" | "critical";

/**
 * Interface for the system log data structure
 * Central type definition for logs across the application
 */
export interface SystemLog {
  /** Unique identifier for the log entry */
  id: string;
  /** Tenant identifier for multi-tenant isolation */
  tenant_id?: string;
  /** Severity level of the log */
  level?: LogLevel;
  /** Primary log message */
  message: string;
  /** Optional detailed description */
  description?: string;
  /** The system module that generated the log */
  module?: string;
  /** Additional contextual data as key-value pairs */
  details?: Record<string, any>;
  /** ISO timestamp when the log was created */
  created_at?: string;
  /** Business impact severity */
  severity?: "low" | "medium" | "high" | "critical";
  /** Optional request ID for tracing related logs */
  request_id?: string;
  /** ISO timestamp alias for compatibility with different systems */
  timestamp?: string;
  /** Error message for the log */
  error_message: string;
  /** Type of error for the log */
  error_type: string;
  /** Indicates if the error is user-facing */
  user_facing?: boolean;
  /** Optional user ID associated with the log */
  user_id?: string;
}

/**
 * Filter criteria for querying system logs
 * Used by log viewing and analysis components
 */
export interface LogFilters {
  /** Text search filter applied to log message and description */
  search?: string;
  /** Text search filter applied to log message and description */
  searchTerm?: string;
  /** Filter by specific log levels */
  level?: string[];
  /** Filter by system modules */
  module?: string[];
  /** Filter by tenant ID */
  tenant_id?: string;
  /** Filter logs from a specific start date */
  fromDate?: string;
  /** Filter logs to a specific end date */
  toDate?: string;
  /** Filter logs starting from this date */
  startDate?: string;
  /** Filter logs ending on this date */
  endDate?: string;
  /** Filter logs from this date */
  dateFrom?: string;
  /** Filter logs to this date */
  dateTo?: string;
}

/**
  module: z.array(z.string()).optional(),
  severity: z.array(z.string()).optional(),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date().optional(),
    })
    .optional(),
});

/**
 * Form state interface for log filter inputs
 * Used by filter form components
 */
export interface LogFilterForm {
  search: string;
  level: string;
  module: string;
  severity: string;
  dateRange?: {
    from: Date;
    to?: Date;
  };
}

/**
 * Data structure for error trend analysis charts
 * Used in dashboard and error reporting components
 */
export interface ErrorTrendDataPoint {
  /** Date string in YYYY-MM-DD format */
  date: string;
  /** Total count of errors */
  count: number;
  /** Total logs for comparison */
  total: number;
  /** Count of critical severity errors */
  critical: number;
  /** Count of high severity errors */
  high: number;
  /** Count of medium severity errors */
  medium: number;
  /** Count of low severity errors */
  low: number;
}

/**
 * Represents a logical group of related log entries
 * Used for error analysis and aggregation
 */
export interface LogGroup {
  /** Unique identifier for the group */
  id: string;
  /** Group title/name */
  name: string;
  /** Error message text */
  message: string;
  /** Count of logs in the group */
  count: number;
  /** Most recent occurrence timestamp */
  lastSeen: string;
  /** First occurrence timestamp */
  firstSeen: string;
  /** Primary log level for the group */
  level: LogLevel;
  /** Business impact severity */
  severity: LogSeverity;
  /** Associated system module */
  module?: string;
}

/**
 * Type for representing date ranges in log queries
 */
export interface DateRange {
  /** Start date of the range */
  from: Date;
  /** Optional end date of the range */
  to?: Date;
}

/**
 * Type for system event classification
 */
export type SystemEventType =
  | "info"
  | "warning"
  | "error"
  | "audit"
  | "security";
