

export type LogStatus = 'success' | 'failure' | 'warning' | 'info';

export type SystemEventModule = 
  | 'strategy'
  | 'agent'
  | 'plugin'
  | 'user'
  | 'tenant'
  | 'auth'
  | 'billing'
  | 'hubspot' 
  | 'system';

export type SystemEventType = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'executed' 
  | 'approved' 
  | 'rejected'
  | 'error'
  | 'info'
  | 'warning';

export interface SystemLog {
  id: string;
  module: SystemEventModule;
  event: string;
  created_at: string;
  context?: Record<string, any>;
  tenant_id?: string;
}

export interface AuditLog extends SystemLog {
  user_id?: string;
  action?: string;
  details?: Record<string, any>;
  resource_type?: string;
  resource_id?: string;
  // Add these fields for backward compatibility with data from API
  entity_type?: SystemEventModule; 
  entity_id?: string;
  event_type?: string;
  description?: any;
  metadata?: Record<string, any>;
}
