
import { supabase } from '@/lib/supabase';

/**
 * Log a system event to the system_logs table
 * 
 * @param tenantId The tenant ID
 * @param module The module that generated the event
 * @param event The event type
 * @param data Additional event data
 * @returns The result of the logging operation
 */
export async function logSystemEvent(
  tenantId: string,
  module: string,
  event: string,
  data?: Record<string, any>
): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const { data: logData, error } = await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        module,
        event,
        data
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error logging system event:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      logId: logData.id
    };
  } catch (error: any) {
    console.error('Unexpected error logging system event:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

export default logSystemEvent;
