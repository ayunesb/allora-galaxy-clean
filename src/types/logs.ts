
export interface SystemLog {
  id: string;
  created_at: string;
  timestamp?: string;
  description?: string;
  message?: string;
  level: 'info' | 'warning' | 'error';
  module: string;
  tenant_id?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  request_id?: string;
  error_type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  error_message?: string;
  event?: string;
  event_type?: string;
  context?: string;
  user_facing?: boolean;
  affects_multiple_users?: boolean;
}

export interface Log {
  id: string;
  timestamp?: string;
  created_at?: string;
  message?: string;
  description?: string;
  status?: string;
  event_type?: string;
  level?: string;
  module?: string;
  [key: string]: any;
}

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

export interface LogGroup {
  id: string;
  error_type: string;
  first_seen: string;
  last_seen: string;
  last_occurred: string; // Ensure this property is always included
  occurrences: number;
  severity: string;
  module: string;
  affects_multiple_users: boolean;
  user_facing: boolean;
  sample_message: string;
}

export interface LogTrend {
  date: string;
  count: number;
  level: string;
}
