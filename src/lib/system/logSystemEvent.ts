
import { supabase } from '@/integrations/supabase/client';
import { SystemEventModule, SystemEventType } from '@/types/shared';

/**
 * Log a system event to the system_logs table
 * @param module The module where the event occurred
 * @param event The type of event that occurred
 * @param context Additional context for the event
 * @returns A promise that resolves when the log has been saved
 */
export async function logSystemEvent(
  module: SystemEventModule,
  event: SystemEventType,
  context: Record<string, any> = {}
) {
  try {
    const { error } = await supabase.from('system_logs').insert([
      {
        module,
        event,
        context,
        // Use 'system' for system-wide events that aren't tenant-specific
        tenant_id: context.tenant_id || 'system'
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
  context: Record<string, any> = {}
) {
  logSystemEvent(module, event, context).catch(err => {
    console.warn('Failed to log system event (safe):', err);
  });
}
