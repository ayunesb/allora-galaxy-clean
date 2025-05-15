
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
  | 'onboarding'
  | 'database'; // Added database module to fix test errors

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

// Update LogFilters interface to fix test errors
export interface LogFilters {
  module?: SystemEventModule | string | string[] | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  search?: string;
  severity?: string | string[];
  level?: string | string[];
  error_type?: string | string[];
  fromDate?: string;
  toDate?: string;
  // Add any other filter properties needed
}

// Add SystemLog interface to fix test errors with complete properties
export interface SystemLog {
  id: string;
  module: SystemEventModule;
  event: string;
  level: string;
  message: string;
  description?: string;
  details?: Record<string, any>;
  created_at: string;
  tenant_id?: string;
  user_id?: string;
  error_type?: string;
  severity?: string;
  timestamp?: string;
  context?: string;
  user_facing?: boolean;
  affects_multiple_users?: boolean;
  metadata?: any;
  request_id?: string;
  error_message?: string;
  event_type?: string;
  priority?: string;
}
