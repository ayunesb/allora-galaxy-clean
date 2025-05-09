
// If this file doesn't exist, we'll create it with the necessary types
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export type SystemEventModule = 'auth' | 'strategy' | 'plugin' | 'system' | 'tenant' | 'execution' | string;
export type SystemEventType = 'create' | 'update' | 'delete' | 'error' | 'login' | 'logout' | 'execute' | string;

export interface AuditLog {
  id: string;
  module: SystemEventModule;
  event_type: SystemEventType;
  description?: string;
  tenant_id: string;
  user_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
