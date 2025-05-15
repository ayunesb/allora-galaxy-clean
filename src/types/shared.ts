
// Fix the SystemEventModule type to include all needed modules
export type SystemEventModule = 
  | 'auth'
  | 'strategy'
  | 'agent'
  | 'plugin'
  | 'system'
  | 'billing'
  | 'notification'
  | 'user'
  | 'tenant'
  | 'workspace'
  | 'admin'
  | 'api'
  | 'onboarding';

// Additional shared types to fix type errors
export interface PaginationOptions {
  page: number;
  perPage: number;
}

export interface SortOptions {
  column: string;
  direction: 'asc' | 'desc';
}

export interface TimeRange {
  value: string;
  label: string;
}
