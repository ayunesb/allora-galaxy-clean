
import { supabase } from '@/lib/supabase';

/**
 * Log a system event to the system_logs table
 * 
 * @param tenantId - The tenant ID
 * @param module - The module name
 * @param event - The event name
 * @param context - Additional context data
 * @returns A promise that resolves when logging is complete
 */
export async function logSystemEvent(
  tenantId: string,
  module: string,
  event: string,
  context: Record<string, any> = {}
): Promise<void> {
  try {
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        module,
        event,
        context
      });
  } catch (error) {
    // Don't let logging failures break the application flow
    console.error('Failed to log system event:', error);
  }
}

export default logSystemEvent;
