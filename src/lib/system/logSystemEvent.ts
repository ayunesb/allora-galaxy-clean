
import { supabase } from '@/integrations/supabase/client';
import { SystemEventType } from '@/types/shared';

/**
 * Log a system event to the database
 * @param module The module that generated the event
 * @param level The log level
 * @param data Event data object or description string
 * @param tenant_id The tenant ID (optional, defaults to 'system')
 * @param additionalMetadata Additional metadata for the event (optional)
 * @returns The result of the operation
 */
export async function logSystemEvent(
  module: string,
  level: SystemEventType,
  data: string | Record<string, any>,
  tenant_id: string = 'system',
  additionalMetadata: Record<string, any> = {}
): Promise<any> {
  try {
    // Process the data parameter to handle both string and object formats
    let description: string;
    let context: Record<string, any> = {};
    
    if (typeof data === 'string') {
      description = data;
      context = additionalMetadata;
    } else {
      // If data is an object, extract a description and use the object as context
      description = data.description || data.message || JSON.stringify(data).substring(0, 255);
      context = { ...data, ...additionalMetadata };
    }

    // Convert camelCase keys to snake_case for database
    const formattedData = {
      module,
      level,
      event: typeof data === 'object' && data.event_type ? data.event_type : 'system_event',
      description: description,
      context,
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
