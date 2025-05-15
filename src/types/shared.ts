
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

// Export VoteType to fix test errors
export type VoteType = 'upvote' | 'downvote';

// Add TrendDirection to fix KPICard build error
export type TrendDirection = 'up' | 'down' | 'neutral';

// Add LogFilters interface to fix test errors
export interface LogFilters {
  module?: SystemEventModule | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  search?: string;
  severity?: string;
  level?: string;
  // Add any other filter properties needed
}
