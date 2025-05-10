import { supabase } from '@/integrations/supabase/client';

// Define the module types for better type safety
export type SystemEventModule = 
  | 'auth' 
  | 'strategy' 
  | 'plugin' 
  | 'agent' 
  | 'webhook' 
  | 'notification' 
  | 'system'
  | 'billing'
  | 'execution'
  | 'email';

// Define the log levels
export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

/**
 * Log a system event to the Supabase system_logs table
 * 
 * @param module The system module generating the log
 * @param event The specific event name
 * @param context Additional contextual data (will be stored as JSON)
 * @param tenantId The tenant ID (if applicable)
 * @returns Promise with the log result
 */
export async function logSystemEvent(
  module: SystemEventModule,
  event: string,
  description: string,
  tenantId: string = 'system',
  context: Record<string, any> = {}
): Promise<{ success: boolean; error?: any }> {
  try {
    // Validate required fields
    if (!module) {
      throw new Error('Module is required for system log');
    }
    
    if (!event) {
      throw new Error('Event is required for system log');
    }
    
    // Insert log into database
    const { error } = await supabase
      .from('system_logs')
      .insert({
        module,
        event,
        description,
        tenant_id: tenantId,
        context,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Failed to log system event:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error logging system event:', error);
    
    // Try to persist log in localStorage as fallback
    try {
      if (typeof window !== 'undefined') {
        const fallbackLogs = JSON.parse(localStorage.getItem('system_logs_fallback') || '[]');
        fallbackLogs.push({
          module,
          event,
          description,
          tenant_id: tenantId,
          context,
          created_at: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Keep only the latest 100 logs to prevent localStorage from filling up
        if (fallbackLogs.length > 100) {
          fallbackLogs.shift();
        }
        
        localStorage.setItem('system_logs_fallback', JSON.stringify(fallbackLogs));
      }
    } catch (localStorageError) {
      console.error('Failed to store log in localStorage:', localStorageError);
    }
    
    return { success: false, error };
  }
}

export default logSystemEvent;
