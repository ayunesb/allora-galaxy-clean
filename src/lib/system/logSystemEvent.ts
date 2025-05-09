
import { supabase } from '@/integrations/supabase/client';
import { SystemEventType } from '@/types/shared';

/**
 * Log a system event to the database
 * @param module The module that generated the event
 * @param level The log level
 * @param type The event type
 * @param description The event description
 * @param tenant_id The tenant ID (optional, defaults to 'system')
 * @param metadata Additional metadata for the event
 * @returns The result of the operation
 */
export async function logSystemEvent(
  module: string,
  level: SystemEventType,
  type: string,
  description: string,
  tenant_id: string = 'system',
  metadata: Record<string, any> = {}
): Promise<any> {
  try {
    // Convert camelCase keys to snake_case for database
    const formattedData = {
      module,
      level,
      event: type,
      description: description || JSON.stringify(metadata).substring(0, 255),
      context: metadata,
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

export default logSystemEvent;
