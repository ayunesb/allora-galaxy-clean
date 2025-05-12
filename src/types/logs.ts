
/**
 * System log entry
 */
import { SystemEventModule, SystemEventType } from './shared';

export interface SystemLog {
  id: string;
  module: SystemEventModule;
  event: string;
  created_at: string;
  context?: Record<string, any>;
  tenant_id?: string;
}

/**
 * Audit log entry (alias for SystemLog for backward compatibility)
 */
export interface AuditLog extends SystemLog {}

/**
 * Log filters for querying logs
 */
export interface LogFilters {
  module?: SystemEventModule | null;
  event?: SystemEventType | null;
  fromDate?: Date | null;
  toDate?: Date | null;
  tenant_id?: string;
  searchTerm?: string;
}

// Re-export SystemEventModule and SystemEventType from shared
export type { SystemEventModule, SystemEventType } from './shared';
