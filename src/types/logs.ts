
export interface SystemLog {
  id: string;
  created_at: string;
  tenant_id?: string;
  module: string;
  event_type: string;
  user_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  user_facing?: boolean;
  affects_multiple_users?: boolean;
  message?: string;
  type?: string;
  error_type?: string;
  // Adding properties used in AuditLog.tsx
  event?: string;
  level?: 'info' | 'warning' | 'error' | 'debug';
  context?: string | Record<string, any>;
}

export interface LogFilters {
  search?: string;
  module?: string[];
  event_type?: string[];
  date_range?: { from: Date; to: Date | null };
  user_id?: string;
  tenant_id?: string;
  severity?: string[];
  // Adding date filters used in several components
  fromDate?: string;
  toDate?: string;
}

export interface ErrorGroup {
  id: string;
  message: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  module: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  errorType: string;
  tenant_id?: string;
}

// Adding AuditLog interface that was referenced but not defined
export interface AuditLog extends SystemLog {
  level: 'info' | 'warning' | 'error' | 'debug';
  event: string;
}

// Adding PluginLog interface used in PluginLogItem.tsx
export interface PluginLog {
  id: string;
  created_at: string;
  plugin_id: string;
  tenant_id?: string;
  status?: 'success' | 'error' | 'warning';
  message: string;
  data?: Record<string, any> | string;
  error?: string;
  execution_time?: number;
  xp_earned?: number;
  input?: Record<string, any>;
  output?: Record<string, any>;
}
