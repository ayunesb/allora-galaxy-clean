
// Define the LogModule as a union of string literals
export type LogModule = 
  | 'strategy' 
  | 'agent' 
  | 'plugin' 
  | 'auth' 
  | 'tenant' 
  | 'system' 
  | 'api'
  | 'edge'
  | 'cron'
  | 'webhook'
  | 'notification'
  | 'user'
  | 'billing'
  | 'test-module' // Added for testing purposes
  | string; // Allow string for dynamic modules and backward compatibility

export interface SystemLog {
  id: string;
  created_at: string;
  timestamp: string; 
  module: LogModule;
  level: 'info' | 'warning' | 'error';
  event: string;
  event_type: string;
  description: string;
  message: string;
  tenant_id: string;
  context: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  error_type?: string;
  error_message?: string;
}

export interface ErrorTrendDataPoint {
  date: string;
  count: number;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface LogsApiResponse {
  logs: SystemLog[];
  totalCount: number;
}

export interface LogsQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  level?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  tenantId?: string;
}

export interface LogFilterState {
  level: string;
  module: string;
  dateRange: [Date | null, Date | null];
  search: string;
}
