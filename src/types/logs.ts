
// Define the system log entry type
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  module: string;
  tenant_id?: string;
  user_id?: string;
  details?: any;
  metadata?: Record<string, any>;
  context?: string;
  trace_id?: string;
  request_id?: string;
  component?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  module: string;
  tenant_id?: string;
  user_id?: string;
  details?: Record<string, any>;
  source?: string;
}

export interface LogFilters {
  level?: string[];
  module?: string[];
  tenant?: string[];
  dateRange?: {
    from: Date;
    to?: Date;
  };
  search?: string;
}

export interface LogsQueryParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: LogFilters;
}

export interface LogsResponse {
  logs: SystemLog[];
  total: number;
  page: number;
  pageSize: number;
}
