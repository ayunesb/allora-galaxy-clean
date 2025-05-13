
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
  // Add missing fields to make AuditLog compatible with SystemLog
  module?: SystemEventModule;
  event?: SystemEventType;
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
  // Add fields used in the hooks
  fromDate?: Date | null;
  toDate?: Date | null;
  searchTerm?: string;
}

/**
 * Log status type
 */
export type LogStatus = 'success' | 'failure' | 'warning' | 'info';

// Re-export types from shared to fix the isolatedModules issue
export type { SystemEventModule, SystemEventType } from './shared';

// Export SystemLogFilterState and AuditLogFilterState
export interface SystemLogFilterState {
  module: string;
  event: string;
  fromDate: Date | null;
  toDate: Date | null;
  searchTerm: string;
}

export interface AuditLogFilterState {
  module: string;
  event: string;
  fromDate: Date | null;
  toDate: Date | null;
  searchTerm: string;
}
