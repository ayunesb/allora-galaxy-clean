import { DateRange } from './shared';

/** Filters for the Audit Logs page */
export interface AuditLogFilter {
  /** date range to filter by */
  dateRange?: DateRange;
  /** event type, e.g. "CREATE", "UPDATE" */
  eventType?: string;
  /** entity type, e.g. "User", "Order" */
  entityType?: string;
  /** full-text search term */
  searchTerm?: string;
}

/** Filters for the System Logs page */
export interface SystemLogFilter {
  /** ID of the tenant */
  tenantId?: string;
  /** module name, e.g. "auth", "billing" */
  module?: string;
  /** date range to filter by */
  dateRange?: DateRange;
  /** full-text search term */
  searchTerm?: string;
}
