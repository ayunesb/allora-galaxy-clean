import { supabase } from '@/integrations/supabase/client';

/**
 * Log a system event to the database with fallback mechanisms
 * @param tenantId The tenant ID associated with the event
 * @param module The system module (e.g., 'strategy', 'plugin', 'auth')
 * @param event The event name (e.g., 'strategy_executed', 'login_failed')
 * @param context Additional context for the event
 * @returns Promise that resolves when the event is logged
 */
export async function logSystemEvent(
  tenantId: string,
  module: string,
  event: string,
  context: Record<string, any> = {}
): Promise<void> {
  // Default retry configuration
  const MAX_RETRIES = 3;
  const INITIAL_DELAY = 300; // ms
  
  let retryCount = 0;
  let success = false;
  
  // Add timestamp to context
  const enrichedContext = {
    ...context,
    timestamp: new Date().toISOString(),
    tenant_id: tenantId
  };
  
  // Keep trying until successful or max retries reached
  while (!success && retryCount < MAX_RETRIES) {
    try {
      const { error } = await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenantId,
          module,
          event,
          context: enrichedContext
        });
      
      if (error) {
        throw error;
      }
      
      success = true;
      return;
      
    } catch (error) {
      retryCount++;
      
      console.warn(
        `Failed to log system event (attempt ${retryCount}/${MAX_RETRIES}):`,
        { module, event, error }
      );
      
      if (retryCount < MAX_RETRIES) {
        // Exponential backoff with jitter
        const delay = INITIAL_DELAY * Math.pow(2, retryCount - 1) * (0.75 + Math.random() * 0.5);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we get here, all retries failed
  // Store in localStorage as a last resort for client-side
  if (typeof window !== 'undefined') {
    try {
      const failedLogs = JSON.parse(localStorage.getItem('failedSystemLogs') || '[]');
      failedLogs.push({
        tenant_id: tenantId,
        module,
        event,
        context: enrichedContext,
        failed_at: new Date().toISOString()
      });
      
      // Keep only the last 100 failed logs to prevent storage issues
      if (failedLogs.length > 100) {
        failedLogs.shift();
      }
      
      localStorage.setItem('failedSystemLogs', JSON.stringify(failedLogs));
    } catch (e) {
      // Last resort - console log the error
      console.error('Failed to store system log in localStorage:', e);
    }
  }
  
  // For server-side, at least log to console
  console.error('Failed to log system event after all retries:', {
    tenant_id: tenantId,
    module,
    event,
    context: enrichedContext
  });
}

/**
 * Attempt to sync failed logs that were stored in localStorage
 * Call this periodically or when network connectivity is restored
 */
export async function syncFailedSystemLogs(): Promise<void> {
  if (typeof window === 'undefined') {
    return; // Only run in browser
  }
  
  try {
    const failedLogsStr = localStorage.getItem('failedSystemLogs');
    if (!failedLogsStr) return;
    
    const failedLogs = JSON.parse(failedLogsStr);
    if (!failedLogs.length) return;
    
    const MAX_BATCH_SIZE = 10;
    const successfulIndexes: number[] = [];
    
    // Try to sync logs in batches
    for (let i = 0; i < failedLogs.length; i++) {
      try {
        const log = failedLogs[i];
        const { error } = await supabase
          .from('system_logs')
          .insert({
            tenant_id: log.tenant_id,
            module: log.module,
            event: log.event,
            context: {
              ...log.context,
              synced_at: new Date().toISOString(),
              originally_failed_at: log.failed_at
            }
          });
        
        if (!error) {
          successfulIndexes.push(i);
        }
        
        // Process in small batches to avoid long-running operations
        if ((i + 1) % MAX_BATCH_SIZE === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (e) {
        console.warn('Failed to sync log entry:', e);
      }
    }
    
    // Remove successfully synced logs
    if (successfulIndexes.length > 0) {
      const remainingLogs = failedLogs.filter((_, index) => !successfulIndexes.includes(index));
      localStorage.setItem('failedSystemLogs', JSON.stringify(remainingLogs));
    }
  } catch (e) {
    console.error('Error syncing failed system logs:', e);
  }
}
