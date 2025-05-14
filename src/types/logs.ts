
import { SystemEventModule, LogSeverity } from './shared';

export interface SystemLog {
  id: string;
  tenant_id?: string;
  module: SystemEventModule;
  severity: LogSeverity;
  event: string;
  message: string;
  context?: any;
  created_at: string;
}

export interface AuditLogItem extends SystemLog {
  metadata?: any;
  status?: 'success' | 'failure' | 'warning';
}
