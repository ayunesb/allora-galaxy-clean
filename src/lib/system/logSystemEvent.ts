
import { supabase } from '@/lib/supabase';

/**
 * Log a system event to the system_logs table
 * 
 * @param tenantId - The tenant ID
 * @param module - The module name
 * @param event - The event name
 * @param context - Additional context data
 * @returns A promise that resolves when logging is complete
 */
export async function logSystemEvent(
  tenantId: string,
  module: string,
  event: string,
  context: Record<string, any> = {}
): Promise<void> {
  try {
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: tenantId,
        module,
        event,
        context
      });
  } catch (error) {
    // Don't let logging failures break the application flow
    console.error('Failed to log system event:', error);
  }
}

/**
 * Synchronizes any cached local events to Supabase
 * Used in offline recovery scenarios
 */
export async function syncLocalEventsToSupabase(): Promise<void> {
  try {
    const localEvents = localStorage.getItem('cached_system_events');
    
    if (!localEvents) {
      return; // No cached events to sync
    }
    
    const events = JSON.parse(localEvents);
    if (!Array.isArray(events) || events.length === 0) {
      localStorage.removeItem('cached_system_events');
      return;
    }
    
    // Batch insert all cached events
    const { error } = await supabase
      .from('system_logs')
      .insert(events);
      
    if (error) {
      throw error;
    }
    
    // Clear the cache after successful sync
    localStorage.removeItem('cached_system_events');
    console.info(`Successfully synchronized ${events.length} cached system events`);
  } catch (error) {
    console.error('Failed to synchronize cached system events:', error);
    throw error;
  }
}

export default logSystemEvent;
