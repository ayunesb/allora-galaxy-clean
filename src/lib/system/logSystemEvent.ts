
import { supabase } from '@/integrations/supabase/client';
import { SystemEventModule, SystemEventType } from '@/types/shared';

/**
 * Log a system event for monitoring and debugging
 * @param tenantId The tenant ID (if available)
 * @param module The module where the event occurred
 * @param event The type of event
 * @param context Additional context for the event
 * @returns Success status and data
 */
export async function logSystemEvent(
  tenantId: string | null,
  module: SystemEventModule,
  event: SystemEventType,
  context: Record<string, any> = {}
): Promise<{ success: boolean, data?: any, error?: string }> {
  try {
    // Prevent logging when supabase is not available or initialized
    if (!supabase) {
      console.warn(`Cannot log system event: supabase client not available`);
      return { success: false, error: 'Supabase client not available' };
    }
    
    const eventData = {
      module,
      event,
      context,
      tenant_id: tenantId
    };

    // Insert the log entry
    const { data, error } = await supabase
      .from('system_logs')
      .insert(eventData)
      .select()
      .single();
      
    if (error) {
      // Don't throw errors for logging - just report them
      console.error(`Failed to log system event:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err: any) {
    // Fail gracefully - logging should never break app functionality
    console.error(`Error logging system event:`, err);
    return { success: false, error: err.message || 'Unknown error logging system event' };
  }
}
