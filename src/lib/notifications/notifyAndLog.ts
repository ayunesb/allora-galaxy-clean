import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { type SystemEventModule } from '@/types/shared';

/**
 * Notify the user with a toast message
 * @param title The title of the notification
 * @param description The description of the notification
 * @param type The type of the notification
 */
export function notify(title: string, description: string, type: 'success' | 'error' | 'warning' | 'info') {
  toast({
    title: title,
    description: description,
    variant: type,
  });
}

/**
 * Log a system event to Supabase
 * 
 * @param module The module generating the log
 * @param level The log level (info, warning, error, etc)
 * @param data Data to log (string or object with details)
 * @param tenant_id The tenant ID
 * @param additionalMetadata Any additional metadata to include
 * @returns The result of the operation
 */
export async function logSystemEvent(
  module: string,
  level: string,
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

/**
 * Notify the user and log the event to Supabase
 * @param module The module that generated the event
 * @param level The log level
 * @param title The title of the notification
 * @param description The description of the notification
 * @param type The type of the notification
 * @param data Event data object or description string
 * @param tenant_id The tenant ID (optional, defaults to 'system')
 * @param additionalMetadata Additional metadata for the event (optional)
 */
export async function notifyAndLog(
  module: SystemEventModule,
  level: string,
  title: string,
  description: string,
  type: 'success' | 'error' | 'warning' | 'info',
  data: string | Record<string, any>,
  tenant_id: string = 'system',
  additionalMetadata: Record<string, any> = {}
): Promise<any> {
  // Notify the user
  notify(title, description, type);

  // Log the event to Supabase
  return logSystemEvent(module, level, data, tenant_id, additionalMetadata);
}

export default notifyAndLog;
