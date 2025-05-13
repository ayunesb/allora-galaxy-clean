
export type SystemEventModule = 
  | 'system'
  | 'strategy'
  | 'plugin'
  | 'agent'
  | 'user'
  | 'auth'
  | 'tenant';

export type SystemEventType =
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
  | 'create'
  | 'update'
  | 'delete'
  | 'execution_start'
  | 'execution_complete'
  | 'execution_error';

export interface SystemLog {
  id: string;
  tenant_id: string;
  module: SystemEventModule;
  event: SystemEventType;
  context?: Record<string, any>;
  created_at: string;
}

export interface AuditLog extends SystemLog {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
}

export interface AuditLogFilterState {
  module: string;
  event: string;
  fromDate: Date | null;
  toDate: Date | null;
  searchTerm: string;
}

export interface SystemLogFilterState {
  module: string;
  event: string;
  fromDate: Date | null;
  toDate: Date | null;
  searchTerm: string;
}
