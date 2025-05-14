
import { supabase } from '@/lib/supabase';
import { SystemEventModule, LogSeverity } from '@/types/shared';

/**
 * Logs a system event to the database.
 * 
 * @param module The module generating the event
 * @param event The event severity or type
 * @param context Additional context for the event
 * @param tenant_id Optional tenant ID for multi-tenant logging
 */
export default async function logSystemEvent(
  module: SystemEventModule | string,
  event: LogSeverity | string,
  context: any,
  tenant_id?: string
): Promise<void> {
  try {
    await supabase
      .from('system_logs')
      .insert({
        module,
        event,
        context,
        tenant_id
      });
      
  } catch (error) {
    console.error('Error logging system event:', error);
    // We don't throw here to avoid causing issues with the main flow
  }
}

// Re-export for backwards compatibility
export { default as logSystemEvent } from './logSystemEvent';
