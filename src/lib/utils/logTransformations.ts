
import { AuditLog, SystemLog } from '@/types/logs';

/**
 * Convert a SystemLog to an AuditLog format
 * @param log The system log to convert
 * @returns An AuditLog object
 */
export const systemLogToAuditLog = (log: SystemLog): AuditLog => {
  return {
    id: log.id,
    action: log.event,
    entity_type: log.module,
    entity_id: log.context?.resource_id || log.id,
    user_id: log.context?.user_id || 'system',
    tenant_id: log.tenant_id || '',
    details: log.context || {},
    created_at: log.created_at,
    module: log.module,
    event: log.event,
    description: log.description,
    context: log.context
  };
};

/**
 * Convert an AuditLog to a SystemLog format
 * @param log The audit log to convert
 * @returns A SystemLog object
 */
export const auditLogToSystemLog = (log: AuditLog): SystemLog => {
  return {
    id: log.id,
    module: log.module || log.entity_type,
    event: log.event || log.action,
    level: log.details?.level || (log.event === 'error' ? 'error' : 'info'),
    description: log.description || log.details?.message || '',
    context: log.context || log.details,
    tenant_id: log.tenant_id,
    created_at: log.created_at,
    user_id: log.user_id
  };
};

/**
 * Group logs by date
 * @param logs The logs to group
 * @returns Logs grouped by date
 */
export const groupLogsByDate = <T extends { created_at: string }>(logs: T[]): Record<string, T[]> => {
  return logs.reduce((groups, log) => {
    const date = new Date(log.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Filter logs by search term
 * @param logs The logs to filter
 * @param searchTerm The search term
 * @returns Filtered logs
 */
export const filterLogsBySearchTerm = <T extends SystemLog | AuditLog>(logs: T[], searchTerm: string): T[] => {
  if (!searchTerm) return logs;
  
  const term = searchTerm.toLowerCase();
  return logs.filter(log => {
    // For SystemLog
    if ('module' in log && log.module?.toLowerCase().includes(term)) return true;
    if ('event' in log && log.event?.toLowerCase().includes(term)) return true;
    if ('description' in log && log.description?.toLowerCase().includes(term)) return true;
    
    // For AuditLog
    if ('action' in log && log.action?.toLowerCase().includes(term)) return true;
    if ('entity_type' in log && log.entity_type?.toLowerCase().includes(term)) return true;
    
    // Common fields in context/details
    const contextDetails = ('context' in log && log.context) ? log.context : 
                           ('details' in log && log.details) ? log.details : {};
    if (JSON.stringify(contextDetails).toLowerCase().includes(term)) return true;
    
    return false;
  });
};
