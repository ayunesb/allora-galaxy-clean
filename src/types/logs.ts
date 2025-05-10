
// Logs related types
export interface SystemLog {
  id: string;
  module: string;
  event: string;
  context?: Record<string, any>;
  created_at: string;
  tenant_id?: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  event_type: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
  module?: string;
  tenant_id?: string;
}

// Log status type
export type LogStatus = 'success' | 'error' | 'warning' | 'info';

// System event module type for logs
export type SystemEventModule = 
  | 'auth' 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'webhook' 
  | 'notification' 
  | 'system'
  | 'billing'
  | 'execution'
  | 'email'
  | 'onboarding';

// System event type for logs
export type SystemEventType = string;
