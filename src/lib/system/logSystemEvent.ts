
import { supabase } from '@/lib/supabase';

/**
 * Log a system event to the system_logs table
 * With fallbacks for when Supabase is unavailable
 * 
 * @param tenant_id - The tenant ID
 * @param module - The system module (e.g., 'auth', 'strategy', 'plugin')
 * @param event - The event name (e.g., 'user_login', 'strategy_executed')
 * @param context - Additional context data for the event (optional)
 * @returns Promise that resolves when the event is logged
 */
export async function logSystemEvent(
  tenant_id: string | null, 
  module: string, 
  event: string, 
  context: Record<string, any> = {}
): Promise<void> {
  try {
    if (!tenant_id) {
      console.warn(`Cannot log system event (${module}:${event}) without a tenant_id`);
      return;
    }

    // Ensure the tenant_id is always a valid UUID
    if (typeof tenant_id !== 'string' || tenant_id.trim() === '') {
      console.warn(`Invalid tenant_id provided for system event (${module}:${event})`);
      return;
    }

    const { error } = await supabase.from('system_logs').insert({
      tenant_id,
      module,
      event,
      context
    });

    if (error) {
      console.error(`Error logging system event (${module}:${event}):`, error);
      // Store in local storage for later sync
      storeEventLocally(tenant_id, module, event, context);
    }
  } catch (err) {
    // Don't let logging failures break the application
    console.error(`Failed to log system event (${module}:${event}):`, err);
    // Store in local storage for later sync
    if (tenant_id) {
      storeEventLocally(tenant_id, module, event, context);
    }
  }
}

/**
 * Store system event locally for later synchronization
 */
function storeEventLocally(
  tenant_id: string,
  module: string,
  event: string,
  context: Record<string, any>
): void {
  try {
    // Make sure we're in a browser environment before using localStorage
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('Cannot store events locally outside of browser environment');
      return;
    }
    
    // Get existing events from local storage
    const localEventsStr = localStorage.getItem('pendingSystemLogs');
    const localEvents = localEventsStr ? JSON.parse(localEventsStr) : [];
    
    // Add new event
    localEvents.push({
      tenant_id,
      module,
      event,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Store back in local storage (limit to 100 events to prevent storage overflow)
    const limitedEvents = localEvents.slice(-100);
    localStorage.setItem('pendingSystemLogs', JSON.stringify(limitedEvents));
  } catch (err) {
    console.error('Failed to store event locally:', err);
  }
}

/**
 * Synchronize locally stored events to Supabase
 * @returns Promise that resolves when synchronization is complete
 */
export async function syncLocalEventsToSupabase(): Promise<{ 
  success: boolean; 
  syncedCount: number; 
  remainingCount: number;
}> {
  try {
    // Make sure we're in a browser environment before using localStorage
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('Cannot sync events outside of browser environment');
      return { success: true, syncedCount: 0, remainingCount: 0 };
    }
    
    // Get local events
    const localEventsStr = localStorage.getItem('pendingSystemLogs');
    if (!localEventsStr) {
      return { success: true, syncedCount: 0, remainingCount: 0 };
    }
    
    const localEvents = JSON.parse(localEventsStr);
    if (!localEvents.length) {
      return { success: true, syncedCount: 0, remainingCount: 0 };
    }
    
    // Take first 20 events for batch processing
    const batchToSync = localEvents.slice(0, 20);
    const remaining = localEvents.slice(20);
    
    // Prepare data for bulk insert
    const batchData = batchToSync.map((event: any) => ({
      tenant_id: event.tenant_id,
      module: event.module,
      event: event.event,
      context: event.context,
      created_at: event.timestamp
    }));
    
    // Bulk insert into Supabase
    const { error } = await supabase.from('system_logs').insert(batchData);
    
    if (error) {
      throw new Error(`Failed to sync logs: ${error.message}`);
    }
    
    // Update local storage with remaining events
    localStorage.setItem('pendingSystemLogs', JSON.stringify(remaining));
    
    return {
      success: true,
      syncedCount: batchToSync.length,
      remainingCount: remaining.length
    };
  } catch (err) {
    console.error('Error syncing local events:', err);
    return {
      success: false,
      syncedCount: 0,
      remainingCount: -1 // Signal an error occurred
    };
  }
}

/**
 * Periodically sync local events to Supabase
 * @param intervalMs Interval in milliseconds to check for pending events
 * @returns Cleanup function to stop periodic sync
 */
export function startPeriodicSync(intervalMs = 60000): () => void {
  // Make sure we're in a browser environment
  if (typeof window === 'undefined') {
    console.warn('Cannot start periodic sync outside of browser environment');
    return () => {};
  }
  
  const intervalId = setInterval(async () => {
    try {
      const result = await syncLocalEventsToSupabase();
      if (result.syncedCount > 0) {
        console.log(`Synced ${result.syncedCount} system logs, ${result.remainingCount} remaining.`);
      }
    } catch (e) {
      console.error('Error during periodic sync:', e);
    }
  }, intervalMs);
  
  return () => clearInterval(intervalId);
}
