
import { supabase } from '@/integrations/supabase/client';
import { SystemEventModule, SystemEventType } from '@/types/shared';

interface LogSystemEventResult {
  success: boolean;
  error?: string;
}

/**
 * Log a system event to the system_logs table
 * @param module The module where the event occurred
 * @param event The type of event that occurred
 * @param context Additional context for the event
 * @param tenantId Optional tenant ID (defaults to 'system' for system-wide events)
 * @returns A promise that resolves when the log has been saved
 */
export async function logSystemEvent(
  module: SystemEventModule,
  event: SystemEventType,
  context: Record<string, any> = {},
  tenantId: string = 'system'
): Promise<LogSystemEventResult> {
  try {
    // Ensure we have valid module and event values
    if (!module || !event) {
      console.error('Invalid module or event for system log:', { module, event });
      return { success: false, error: 'Invalid module or event' };
    }

    // Ensure tenant_id is set correctly
    const effectiveTenantId = context.tenant_id || tenantId || 'system';

    // Ensure context is serializable
    let safeContext = {};
    try {
      // First convert to string and back to ensure it's JSON serializable
      safeContext = JSON.parse(JSON.stringify(context));
    } catch (err) {
      console.warn('Context could not be serialized for logging:', err);
      safeContext = { error: 'Context serialization failed', originalContext: String(context) };
    }

    // Insert the log entry
    const { error } = await supabase.from('system_logs').insert([
      {
        module,
        event,
        context: safeContext,
        tenant_id: effectiveTenantId
      }
    ]);

    if (error) {
      console.error('Failed to log system event:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    // Don't let logging failures break the application
    console.error('Error logging system event:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Safe wrapper around logSystemEvent that won't throw errors
 * For use in critical paths where logging should never break functionality
 */
export function safeLogSystemEvent(
  module: SystemEventModule,
  event: SystemEventType,
  context: Record<string, any> = {},
  tenantId: string = 'system'
): void {
  logSystemEvent(module, event, context, tenantId).catch(err => {
    console.warn('Failed to log system event (safe):', err);
  });
}

/**
 * Log an error as a system event
 * @param module The module where the error occurred
 * @param error The error object or message
 * @param additionalContext Additional context for the error
 * @param tenantId Optional tenant ID (defaults to 'system' for system-wide errors)
 */
export function logErrorEvent(
  module: SystemEventModule,
  error: Error | string,
  additionalContext: Record<string, any> = {},
  tenantId: string = 'system'
): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  safeLogSystemEvent(module, 'error', {
    ...additionalContext,
    error: errorMessage,
    stack: errorStack
  }, tenantId);
}

/**
 * Log audit events for security-sensitive operations
 * This will be treated as a special event type for compliance purposes
 */
export function logAuditEvent(
  action: string,
  userId: string,
  resourceType: string,
  resourceId: string,
  additionalContext: Record<string, any> = {},
  tenantId: string = 'system'
): void {
  safeLogSystemEvent('security', 'info', {
    action,
    user_id: userId,
    resource_type: resourceType,
    resource_id: resourceId,
    audit: true,  // Mark as an audit event
    ...additionalContext
  }, tenantId);
}
