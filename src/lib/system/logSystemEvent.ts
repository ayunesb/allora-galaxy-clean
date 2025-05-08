
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

    const { error } = await supabase.from('system_logs').insert([
      {
        module,
        event,
        context,
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
    return { success: false, error: err.message };
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
 * @param action The action being performed
 * @param userId The ID of the user performing the action
 * @param resourceType The type of resource being accessed
 * @param resourceId The ID of the resource being accessed
 * @param additionalContext Additional context for the audit
 * @param tenantId Optional tenant ID (defaults to 'system' for system-wide audits)
 */
export function logAuditEvent(
  action: string,
  userId: string,
  resourceType: string,
  resourceId: string,
  additionalContext: Record<string, any> = {},
  tenantId: string = 'system'
): void {
  safeLogSystemEvent('security', 'audit', {
    action,
    user_id: userId,
    resource_type: resourceType,
    resource_id: resourceId,
    ...additionalContext
  }, tenantId);
}
