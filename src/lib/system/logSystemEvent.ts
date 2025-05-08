
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Store logs locally if network is down
const localLogQueue: any[] = [];

/**
 * Log a system event to Supabase
 * Falls back to storing logs locally if network is down
 * 
 * @param tenantId The tenant ID
 * @param module The system module (e.g., 'strategy', 'plugin')
 * @param event The event name
 * @param context Optional context data
 * @returns Promise with success status
 */
export async function logSystemEvent(
  tenantId: string, 
  module: string, 
  event: string, 
  context: Record<string, any> = {}
): Promise<{ success: boolean; error?: Error }> {
  const logEntry = {
    tenant_id: tenantId,
    module,
    event,
    context,
    created_at: new Date().toISOString()
  };

  try {
    // Try to insert the log directly
    const { error } = await supabase
      .from('system_logs')
      .insert(logEntry);

    if (error) {
      console.error('Error logging system event to Supabase:', error);
      
      // Store locally if Supabase insert fails
      localLogQueue.push({
        ...logEntry,
        id: uuidv4(),
        local_created_at: new Date().toISOString()
      });
      
      return { success: false, error };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Exception logging system event:', error);
    
    // Store locally if there's a network error
    localLogQueue.push({
      ...logEntry,
      id: uuidv4(),
      local_created_at: new Date().toISOString()
    });
    
    return { success: false, error };
  }
}

/**
 * Get the number of pending local logs
 */
export function getPendingLogsCount(): number {
  return localLogQueue.length;
}

/**
 * Export local log queue for testing purposes
 */
export function getLocalLogQueue(): any[] {
  return [...localLogQueue];
}

/**
 * Clear the local log queue
 */
export function clearLocalLogQueue(): void {
  localLogQueue.length = 0;
}

/**
 * Check if system has network connectivity
 */
export function checkNetworkStatus(): boolean {
  return navigator.onLine;
}
