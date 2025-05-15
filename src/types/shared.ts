
// Export shared types across the application
import { VoteType } from './voting';
import { TrendDirection } from './kpi';

// Re-export types from specific domains for broader usage
export { VoteType, TrendDirection };

export interface DateRange {
  from?: Date;
  to?: Date;
}

export type SystemEventModule = 
  | 'system' 
  | 'auth' 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'user' 
  | 'api' 
  | 'database' 
  | 'cron';

export interface LogFilters {
  search?: string;
  tenant_id?: string;
  module?: string | string[];
  level?: string[];
  error_type?: string[];
  severity?: string | string[];
  fromDate?: string;
  toDate?: string;
  user_id?: string;
  limit?: number;
  user_facing?: boolean;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}
