
export interface SystemLog {
  id: string;
  created_at: string;
  tenant_id?: string;
  user_id?: string;
  level: 'info' | 'warning' | 'error';
  module: string;
  description: string;
  event?: string;
  error?: string;
  error_type?: string;
  error_code?: string;
  context?: any;
  metadata?: any;
  request_id?: string;
  source_ip?: string;
}

export interface PluginLog {
  id: string;
  created_at: string;
  plugin_id: string;
  execution_id: string;
  tenant_id?: string;
  status?: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  execution_time?: number;
  error?: string;
}

export interface LogFilters {
  search?: string;
  level?: string[];
  module?: string[];
  fromDate?: string;
  toDate?: string;
  tenant_id?: string[];
  user_id?: string[];
  event?: string[];
  error_code?: string[];
}

export interface ErrorGroup {
  isGroup: boolean;
  relatedLogs: SystemLog[];
  id: string;
  message: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  errorType: string;
  severity: string;
  module: string;
  user_facing: boolean;
}
