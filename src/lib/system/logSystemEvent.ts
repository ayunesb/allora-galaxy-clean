
import { supabase } from '@/lib/supabase';
import { SystemEventModule, LogSeverity } from '@/types/shared';

/**
 * Logs a system event to the database.
 * 
 * @param module The module generating the event
 * @param severity The event severity level
 * @param context Additional context for the event
 * @param tenant_id Optional tenant ID for multi-tenant logging
 * @returns Promise that resolves when the log is created
 */
export async function logSystemEvent(
  module: SystemEventModule | string,
  severity: LogSeverity | string,
  context: any,
  tenant_id?: string
): Promise<void> {
  try {
    await supabase
      .from('system_logs')
      .insert({
        module,
        severity,
        event: context?.event_type || 'system_event',
        context,
        tenant_id
      });
      
  } catch (error) {
    console.error('Error logging system event:', error);
    // We don't throw here to avoid causing issues with the main flow
  }
}

export default logSystemEvent;
