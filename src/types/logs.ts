
import { SystemEventType } from './shared';

/**
 * System log entry
 */
export interface SystemLog {
  id: string;
  module: SystemEventModule;
  event: string;
  created_at: string;
  context?: Record<string, any>;
  tenant_id?: string;
}

/**
 * System event modules
 */
export type SystemEventModule = 'user' | 'auth' | 'strategy' | 'plugin' | 'agent' | 'system' | 'billing' | 'tenant';

/**
 * Audit log entry (alias for SystemLog for backward compatibility)
 */
export interface AuditLog extends SystemLog {}

/**
 * Log filters for querying logs
 */
export interface LogFilters {
  module?: SystemEventModule;
  event?: SystemEventType;
  fromDate?: string;
  toDate?: string;
  tenant_id?: string;
  searchTerm?: string;
}
