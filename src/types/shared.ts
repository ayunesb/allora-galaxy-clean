
// Shared type definitions used across the application

// System Event Types
export type SystemEventType = 'error' | 'warn' | 'info' | 'debug';

// Common Status Types
export type Status = 'idle' | 'loading' | 'success' | 'error';

// Common Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination Params
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Sort Direction
export type SortDirection = 'asc' | 'desc';

// Sort Params
export interface SortParams {
  field: string;
  direction: SortDirection;
}
