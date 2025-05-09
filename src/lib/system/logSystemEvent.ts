
import { supabase } from '@/integrations/supabase/client';
import { SystemEventType } from '@/types/shared';

/**
 * Log a system event to the database
 * @param module The module that generated the event
 * @param level The log level
 * @param data The data to log
 * @param tenant_id The tenant ID (optional, defaults to 'system')
 * @returns The result of the operation
 */
export async function logSystemEvent(
  module: string,
  level: SystemEventType,
  data: Record<string, any>,
  tenant_id: string = 'system'
): Promise<any> {
  try {
    // Convert camelCase keys to snake_case for database
    const formattedData = {
      module,
      level,
      type: data.event_type || data.action || 'info',
      description: data.message || JSON.stringify(data).substring(0, 255),
      metadata: data,
      tenant_id
    };

    const { data: result, error } = await supabase
      .from('system_logs')
      .insert(formattedData)
      .select()
      .single();
      
    if (error) {
      console.error('Error logging system event:', error);
      return { success: false, error };
    }
    
    return { success: true, data: result };
  } catch (err: any) {
    console.error('Failed to log system event:', err);
    return { success: false, error: err.message };
  }
}
