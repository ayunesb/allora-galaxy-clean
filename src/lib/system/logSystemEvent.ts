
import { supabase } from '@/integrations/supabase/client';

/**
 * Log a system event to the system_logs table
 * 
 * @param tenant_id - The tenant ID
 * @param module - The system module (e.g., 'auth', 'strategy', 'plugin')
 * @param event - The event name (e.g., 'user_login', 'strategy_executed')
 * @param context - Additional context data for the event (optional)
 * @returns Promise that resolves when the event is logged
 */
export async function logSystemEvent(
  tenant_id: string | null, 
  module: string, 
  event: string, 
  context: Record<string, any> = {}
): Promise<void> {
  try {
    if (!tenant_id) {
      console.warn(`Cannot log system event (${module}:${event}) without a tenant_id`);
      return;
    }

    const { error } = await supabase.from('system_logs').insert({
      tenant_id,
      module,
      event,
      context
    });

    if (error) {
      console.error(`Error logging system event (${module}:${event}):`, error);
    }
  } catch (err) {
    // Don't let logging failures break the application
    console.error(`Failed to log system event (${module}:${event}):`, err);
  }
}
