
// Base system event modules for logging
export type SystemEventModule = 
  | 'system'
  | 'auth'
  | 'onboarding'
  | 'strategy'
  | 'execution'
  | 'plugin'
  | 'agent'
  | 'database'
  | 'api'
  | 'notification'
  | 'user'
  | 'billing'
  | 'workspace'
  | 'cron'
  | 'evolution';

// Status types used across the application
export type Status = 'idle' | 'loading' | 'success' | 'error';

// Common response format for API calls
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  status?: number;
}

// Base pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// Base filter params for listings
export interface FilterParams {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Base timestamp fields for database tables
export interface TimestampFields {
  created_at: string;
  updated_at?: string;
}

// Generic key-value record
export type KeyValueRecord = Record<string, any>;
