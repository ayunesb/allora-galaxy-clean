
/**
 * Type definitions for system logs
 */

export interface SystemLog {
  id: string;
  module: string;
  level?: string;
  event: string;
  description?: string;
  context: Record<string, any>;
  created_at: string;
  tenant_id?: string;
  user_id?: string;
}

export interface LogFilter {
  module?: string | null;
  level?: string | null;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  searchTerm?: string;
  tenant_id?: string | null;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}
