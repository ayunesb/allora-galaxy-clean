
import { SystemEventModule, SystemEventType } from './shared';

/**
 * System log entity interface
 */
export interface SystemLog {
  id: string;
  module: SystemEventModule;
  event: SystemEventType;
  context?: Record<string, any> | null;
  created_at: string;
  tenant_id?: string | null;
}

/**
 * Audit log entity interface
 */
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any> | null;
  created_at: string;
  tenant_id?: string | null;
}

/**
 * Log filters interface
 */
export interface LogFilters {
  module: SystemEventModule | null;
  event: SystemEventType | null;
  search?: string;
  date_from?: Date | null;
  date_to?: Date | null;
  tenant_id?: string | null;
  limit?: number;
  offset?: number;
}

/**
 * Log status type
 */
export type LogStatus = 'success' | 'failure' | 'warning' | 'info';
