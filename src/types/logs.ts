
import { SystemEventModule, SystemEventType } from './shared';

export type LogStatus = 'success' | 'failure' | 'warning' | 'info';

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
  error?: string;
  // Add these fields for backward compatibility with data from API
  entity_type?: SystemEventModule; 
  entity_id?: string;
  event_type?: string;
  description?: any;
  metadata?: Record<string, any>;
}
