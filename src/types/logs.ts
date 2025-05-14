
/**
 * Type definitions for system logs
 */

export interface SystemLog {
  id: string;
  tenant_id?: string;
  module: string;
  level?: string;
  severity?: string;
  event: string;
  description?: string;
  message?: string;
  context: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  user_id?: string;
  status?: string;
}

export interface LogFilter {
  module?: string | null;
  level?: string | null;
  severity?: string | null;
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

export type AuditLog = SystemLog;
