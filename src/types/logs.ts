
/**
 * Log-related type definitions
 */

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  module: string;
  message: string;
  tenant_id: string;
  user_id?: string;
  metadata?: Record<string, any>;
  error_details?: string;
  session_id?: string;
  created_at: string;
  severity?: string; // Added for ErrorTrendsChart
  error_type?: string; // Added for ErrorTrendsChart
}

export interface PluginLog {
  id: string;
  plugin_id: string;
  plugin_name?: string;
  tenant_id: string;
  execution_id: string;
  strategy_id?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  details?: Record<string, any>;
  created_at: string;
  duration_ms?: number;
  success: boolean;
  user_id?: string;
}

export interface LogFilter {
  level?: 'info' | 'warn' | 'error' | 'debug' | 'all';
  module?: string;
  tenant_id?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  search?: string;
  user_id?: string;
  session_id?: string;
  limit?: number;
  offset?: number;
  severity?: string | string[]; // Added for ErrorMonitoringFilters
}

export type LogFilters = LogFilter;

export interface LogCount {
  level: 'info' | 'warn' | 'error' | 'debug';
  count: number;
}

export interface LogStats {
  totalLogs: number;
  logsByLevel: LogCount[];
  logsByModule: { module: string; count: number }[];
  errorRate: number;
  recentTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface LogExportOptions {
  format: 'csv' | 'json';
  filters: LogFilter;
  includeMetadata: boolean;
}

export interface LogAnalysisResults {
  commonPatterns: string[];
  anomalies: string[];
  suggestedActions: string[];
}

export interface LogGroup {
  id: string;
  message: string;
  count: number;
  lastOccurred: string;
  firstOccurred: string;
  severity: string;
  module: string;
}

// For compatibility with EvolutionDashboard
export type Log = SystemLog;
