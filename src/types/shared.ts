
import { DateRange as ReactDateRange } from "@/components/ui/date-range-picker";

/**
 * Represents a date range with from and to dates
 */
export type DateRange = ReactDateRange;

/**
 * Standard sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Valid system event modules
 */
export type SystemEventModule = 
  | 'system'
  | 'auth'
  | 'admin'
  | 'strategy'
  | 'agent'
  | 'evolution'
  | 'plugin'
  | 'integration'
  | 'tenant'
  | 'user'
  | 'monitoring'
  | 'analytics';

/**
 * Standard result type for database operations
 */
export interface DbResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

/**
 * Standard response type for API operations
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  status?: number;
}

/**
 * Standard pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Standard paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
