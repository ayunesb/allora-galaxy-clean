
import { supabase } from '@/integrations/supabase/client';

/**
 * Log a system event to the system_logs table
 * @param module The module that generated the event (e.g., 'strategy', 'plugin', 'agent')
 * @param event The event or log level (e.g., 'info', 'warning', 'error', 'strategy_executed')
 * @param context Additional context for the event
 * @param tenantId Optional tenant ID
 * @returns Success status
 */
export async function logSystemEvent(
  module: string, 
  event: string,
  context: Record<string, any> = {},
  tenantId?: string
): Promise<boolean> {
  try {
    // Create the log entry
    const logEntry = {
      module,
      event,
      context,
      tenant_id: tenantId
    };
    
    // Insert into system_logs table
    const { error } = await supabase
      .from('system_logs')
      .insert(logEntry);
    
    if (error) {
      console.error('Error logging system event:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    // Don't let logging failures break the application
    console.error('Error in logSystemEvent:', err);
    return false;
  }
}
