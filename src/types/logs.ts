/**
 * Type definitions for system logs and error monitoring
 * @module types/logs
 */

import { SystemEventModule } from './shared';

/**
 * Log severity levels
 */
export type LogSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Log level types
 */
export type LogLevel = 'info' | 'warning' | 'error';

/**
 * System log entry interface
 * Represents a log entry in the system_logs table
 */
export interface SystemLog {
  /** Unique identifier for the log */
  id: string;
  
  /** When the log was created */
  created_at: string;
  
  /** Timestamp in ISO format */
  timestamp: string;
  
  /** System module that generated the log */
  module: string;
  
  /** Log level (info, warning, error) */
  level: LogLevel;
  
  /** Event type identifier */
  event: string;
  
  /** Alternative name for event */
  event_type?: string;
  
  /** Log description */
  description: string;
  
  /** Log message (for backward compatibility) */
  message?: string;
  
  /** Tenant ID */
  tenant_id: string;
  
  /** User ID that triggered the event (if applicable) */
  user_id?: string;
  
  /** Additional context data */
  context?: Record<string, any>;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
  
  /** Request ID for tracing */
  request_id?: string;
  
  /** Error type if this is an error log */
  error_type?: string;
  
  /** Severity level of the error */
  severity?: LogSeverity;
  
  /** Priority (alias for severity) */
  priority?: LogSeverity;
  
  /** Error message if this is an error log */
  error_message?: string;
  
  /** Whether this error affects user experience */
  user_facing?: boolean;
  
  /** Whether this error affects multiple users */
  affects_multiple_users?: boolean;
}

/**
 * Date range interface for date filters
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Filters for querying logs
 */
export interface LogFilters {
  /** Text search across log fields */
  search?: string;
  
  /** Search term (alias for search) for backwards compatibility */
  searchTerm?: string;
  
  /** Filter by module(s) */
  module?: string | string[];
  
  /** Filter by log level(s) */
  level?: LogLevel | LogLevel[];
  
  /** Filter by tenant */
  tenant_id?: string;
  
  /** Filter by date range - start date */
  fromDate?: string;
  
  /** Start date alias for backwards compatibility */
  startDate?: string;
  
  /** Date from alias for backwards compatibility */
  dateFrom?: string;
  
  /** Filter by date range - end date */
  toDate?: string;
  
  /** End date alias for backwards compatibility */
  endDate?: string;
  
  /** Date to alias for backwards compatibility */
  dateTo?: string;
  
  /** Filter by error type */
  error_type?: string | string[];
  
  /** Filter by severity */
  severity?: LogSeverity | LogSeverity[];
}

/**
 * Error group represents a collection of related errors
 */
export interface ErrorGroup {
  /** Group identifier */
  id: string;
  
  /** Error type */
  error_type: string;
  
  /** Error message */
  message: string;
  
  /** Number of occurrences */
  count: number;
  
  /** Error severity */
  severity: LogSeverity;
  
  /** When this error was first seen */
  first_seen: string;
  
  /** When this error was last seen */
  last_seen: string;
  
  /** Number of affected users */
  affected_users: number;
  
  /** Number of affected tenants */
  affected_tenants: number;
  
  /** Modules where this error occurred */
  modules: string[];
  
  /** Example occurrences */
  examples: SystemLog[];
}

/**
 * Data point for error trends chart
 */
export interface ErrorTrendDataPoint {
  /** Date string (YYYY-MM-DD) */
  date: string;
  
  /** Total error count */
  total: number;
  
  /** Critical errors count */
  critical: number;
  
  /** High severity errors count */
  high: number;
  
  /** Medium severity errors count */
  medium: number;
  
  /** Low severity errors count */
  low: number;
}

/**
 * Error statistics summary
 */
export interface ErrorStats {
  /** Total error count */
  totalErrors: number;
  
  /** Critical errors count */
  criticalErrors: number;
  
  /** High severity errors count */
  highErrors: number;
  
  /** Medium severity errors count */
  mediumErrors: number;
  
  /** Low severity errors count */
  lowErrors: number;
  
  /** User-facing errors count */
  userFacingErrors: number;
  
  /** Number of affected users */
  affectedUsers: number;
}
