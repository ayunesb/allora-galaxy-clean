
// Common shared types used across the application

/**
 * System event modules for logging and filtering
 */
export type SystemEventModule = 
  | 'strategy'
  | 'plugin'
  | 'agent'
  | 'auth'
  | 'tenant'
  | 'user'
  | 'system'
  | 'kpi'
  | 'execution'
  | 'webhook'
  | 'cron'
  | 'api'
  | string;

/**
 * Log severity levels for system events
 */
export type LogSeverity = 
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'debug'
  | string;

/**
 * Date range for filtering logs and other time-based data
 * Compatible with react-day-picker DateRange
 */
export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

/**
 * System log filter parameters
 */
export interface SystemLogFilter {
  module?: SystemEventModule | SystemEventModule[];
  event?: string;
  searchTerm: string;
  dateRange?: DateRange;
}

/**
 * Trend direction for KPIs and metrics
 */
export type TrendDirection = 
  | 'up'
  | 'down'
  | 'neutral'
  | string;

/**
 * Vote types for agent evaluations
 */
export type VoteType = 'up' | 'down' | null;
