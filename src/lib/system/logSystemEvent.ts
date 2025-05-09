
import { supabase } from '@/integrations/supabase/client';

/**
 * Log a system event to the system_logs table
 * @param module The system module (e.g., 'agent', 'strategy', 'plugin')
 * @param event The event type (e.g., 'created', 'updated', 'executed')
 * @param context Additional context for the event
 * @param tenantId The tenant ID
 * @returns Success status and optional error
 */
export async function logSystemEvent(
  module: string, 
  event: string,
  context: Record<string, any> = {},
  tenantId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('system_logs')
      .insert({
        module,
        event,
        context,
        tenant_id: tenantId
      });
      
    if (error) {
      console.error(`Error logging ${module}.${event} event:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    // Don't let logging failures break the application
    console.error('Error in logSystemEvent:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error during system event logging'
    };
  }
}
