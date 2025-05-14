
// Common shared types used across the application

// System event modules
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

// Log severity levels
export type LogSeverity = 
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'debug'
  | string;

// Date range for filtering logs
export interface DateRange {
  from: Date;
  to?: Date;
}

// System log filter type
export interface SystemLogFilter {
  module?: SystemEventModule | SystemEventModule[];
  event?: string;
  searchTerm: string;
  dateRange?: DateRange;
}

// Trend direction for KPIs
export type TrendDirection = 
  | 'up'
  | 'down'
  | 'neutral'
  | string;
