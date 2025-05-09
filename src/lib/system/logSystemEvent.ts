
import { supabase } from '@/integrations/supabase/client';

/**
 * Log a system event to the system_logs table
 * @param tenantId The tenant ID, or 'system' for system-wide events
 * @param module The system module (e.g., 'auth', 'strategy', 'plugin')
 * @param eventType The event type (e.g., 'created', 'updated', 'executed')
 * @param context Additional context for the event
 * @param level Log level (info, warn, error)
 * @returns Success status and optional error
 */
export async function logSystemEvent(
  tenantId: string,
  module: string,
  eventType: string,
  context: Record<string, any> = {},
  level: 'info' | 'warn' | 'error' = 'info'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('system_logs')
      .insert([{
        tenant_id: tenantId,
        module,
        event: eventType,
        level,
        context,
        created_at: new Date().toISOString()
      }]);
      
    if (error) {
      console.error(`Error logging ${module}.${eventType} event:`, error);
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

/**
 * Alias for backward compatibility
 */
export const logEvent = logSystemEvent;
