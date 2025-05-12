
import { Json } from './supabase';
import { SystemEventModule, SystemEventType } from './shared';

export interface BaseLog {
  id: string;
  created_at: string;
  tenant_id?: string | null;
}

export interface AuditLog extends BaseLog {
  event_type: string;
  entity_type: string;
  entity_id: string;
  description?: string | null;
  user_id?: string | null;
  metadata?: Record<string, any> | null;
}

export interface SystemLog extends BaseLog {
  module: SystemEventModule;
  event: SystemEventType;
  description?: string | null;
  context?: Json | null;
  tenant_id?: string | null;
}

export interface LogHistoryFilter {
  module?: string;
  event_type?: string;
  entity_type?: string;
  from_date?: string;
  to_date?: string;
  user_id?: string;
}
