
import { AuditLog, SystemLog } from '@/types/logs';

/**
 * Converts an AuditLog to a SystemLog for display compatibility
 */
export const auditLogToSystemLog = (log: AuditLog): SystemLog => {
  return {
    id: log.id,
    module: log.module || log.resource_type || 'unknown',
    event: log.event || log.action || 'unknown',
    context: {
      user_id: log.user_id,
      resource_id: log.resource_id,
      details: log.details
    },
    created_at: log.created_at,
    tenant_id: log.tenant_id
  };
};

/**
 * Converts a SystemLog to an AuditLog for display compatibility
 */
export const systemLogToAuditLog = (log: SystemLog): AuditLog => {
  const context = log.context || {};
  
  return {
    id: log.id,
    user_id: context.user_id || 'system',
    action: log.event,
    resource_type: log.module,
    resource_id: context.resource_id,
    details: context.details || log.context,
    created_at: log.created_at,
    tenant_id: log.tenant_id,
    module: log.module,
    event: log.event
  };
};
