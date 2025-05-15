// Add missing types for SystemLog
export interface SystemLog {
  id: string;
  created_at: string;
  timestamp: string; // Added for compatibility
  description: string;
  message?: string; // Added for compatibility
  level: 'info' | 'warning' | 'error';
  module: string;
  event: string;
  event_type: 'info' | 'warning' | 'error';
  metadata: Record<string, any>;
  context: string;
  tenant_id?: string; // Added for compatibility
  status?: 'success' | 'error' | 'warning'; // Added for compatibility
  severity?: 'critical' | 'high' | 'medium' | 'low'; // Added for ErrorTrendsChart
  priority?: 'high' | 'medium' | 'low' | 'critical'; // Added for compatibility with filtering
  error_type?: string; // Added for ErrorTrendsChart
  error_message?: string; // Added for compatibility
  user_facing?: boolean;
  affects_multiple_users?: boolean;
  request_id?: string;
  user_id?: string;
}

export interface Log {
  id: string;
  timestamp: string;
  description?: string;
  message?: string;
  level?: 'info' | 'warning' | 'error';
  module?: string;
  event?: string;
  event_type: 'info' | 'warning' | 'error';
  status: 'success' | 'error' | 'warning';
  metadata?: Record<string, any>;
  context?: string;
  created_at?: string; // Added for AuditLog compatibility
  tenant_id?: string; // Added for AuditLog compatibility
}

export interface PluginLog {
  id: string;
  created_at: string;
  plugin_id: string;
  message: string;
  execution_id?: string;
  status?: 'success' | 'error' | 'warning'; // Added for compatibility
  data?: any; // Added for compatibility
  error?: string; // Added for compatibility
  execution_time?: number; // Added for compatibility
}

export interface LogFilters {
  search?: string;
  searchTerm?: string; // Added for compatibility with hooks
  severity?: string;
  module?: string;
  startDate?: string;
  fromDate?: string; // Added for compatibility with hooks
  endDate?: string;
  toDate?: string; // Added for compatibility with hooks
  status?: string;
  limit?: number;
  page?: number;
  event?: string; // Added for compatibility with hooks
  tenant_id?: string; // Added for compatibility with hooks
  error_type?: string | string[]; // Added for compatibility with ErrorGroupsList
  level?: string | string[]; // Added for error filters
}

// Add LogGroup interface for ErrorGroupsList
export interface LogGroup {
  id: string;
  count: number;
  first_seen: string;
  last_seen: string;
  last_occurred?: string; // Changed to match what ErrorGroupsList is expecting
  error_type: string;
  message: string;
  status: string;
  severity: string;
  module: string;
  context?: Record<string, any>;
}

// Export AuditLog interface for compatibility
export interface AuditLog extends Log {
  user_id?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
}

// Add shared types
export interface DateRange {
  from: Date;
  to?: Date;
}

export type SystemEventType = 'info' | 'warning' | 'error' | 'audit' | 'system' | 'user' | string;
