
import { SystemLog, AuditLog } from '@/types/logs';

/**
 * Convert an AuditLog to a SystemLog format
 * @param auditLog The audit log to convert
 * @returns SystemLog representation
 */
export function auditLogToSystemLog(auditLog: AuditLog): SystemLog {
  // Return basic SystemLog properties
  return {
    id: auditLog.id,
    tenant_id: auditLog.tenant_id,
    module: auditLog.module,
    event: auditLog.event,
    context: auditLog.context || auditLog.details || {},
    created_at: auditLog.created_at
  };
}

/**
 * Convert a SystemLog to an AuditLog format
 * @param systemLog The system log to convert
 * @returns AuditLog representation with default values
 */
export function systemLogToAuditLog(systemLog: SystemLog): AuditLog {
  // Extract user_id from context if available
  const userId = systemLog.context?.user_id || 'system';
  const resourceId = systemLog.context?.resource_id;
  const resourceType = systemLog.context?.resource_type || systemLog.module;
  const action = systemLog.context?.action || systemLog.event;
  
  return {
    ...systemLog,
    user_id: userId,
    action: action,
    resource_type: resourceType,
    resource_id: resourceId,
    details: systemLog.context
  };
}

/**
 * Format log context for display
 * @param context The log context object
 * @returns Formatted context with sensitive data masked
 */
export function formatLogContext(context: Record<string, any> | undefined): Record<string, any> {
  if (!context) return {};
  
  // Create a copy to avoid modifying original
  const formatted = { ...context };
  
  // Mask sensitive fields
  const sensitiveFields = ['password', 'token', 'key', 'secret', 'credential'];
  
  Object.keys(formatted).forEach(key => {
    // Check if this is a sensitive field
    const isSensitive = sensitiveFields.some(field => 
      key.toLowerCase().includes(field)
    );
    
    if (isSensitive && typeof formatted[key] === 'string') {
      formatted[key] = '******';
    }
    
    // Recursively process nested objects
    if (formatted[key] && typeof formatted[key] === 'object') {
      formatted[key] = formatLogContext(formatted[key]);
    }
  });
  
  return formatted;
}

/**
 * Get a human-readable summary of the log
 * @param log The log to summarize
 * @returns Human-readable summary
 */
export function getLogSummary(log: SystemLog | AuditLog): string {
  // Try to extract a summary from context fields
  const context = log.context || {};
  
  // Check common message fields
  if (context.message) return context.message;
  if (context.description) return context.description;
  if (context.summary) return context.summary;
  if (context.detail) return context.detail;
  
  // For errors, show error message
  if (log.event === 'error' && context.error) {
    return typeof context.error === 'string' 
      ? context.error
      : JSON.stringify(context.error).substring(0, 100);
  }
  
  // For audit logs with resource info
  if ('resource_id' in log && log.resource_id) {
    return `${log.action} ${log.resource_type} ${log.resource_id.substring(0, 8)}...`;
  }
  
  // Default summary
  return `${log.module} ${log.event} event`;
}
