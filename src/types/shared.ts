
// Basic shared types used across the application

import { DateRange } from './logs';

// Common time periods
export type TimePeriod = '1h' | '24h' | '7d' | '30d' | 'all';

// Common status types
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'warning';

// System event modules for logging
export type SystemEventModule = 
  | 'system'
  | 'auth'
  | 'api'
  | 'database'
  | 'strategy'
  | 'plugin'
  | 'agent'
  | 'execution'
  | 'webhook'
  | 'notification'
  | 'tenant'
  | 'user'
  | string;

// Re-export DateRange for backward compatibility 
export { DateRange };

// Define pagination params for API requests
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Define sorting params for API requests
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Export basic filter interface that can be extended by specific filters
export interface BaseFilter extends PaginationParams, SortParams {
  search?: string;
  startDate?: string;
  endDate?: string;
}
