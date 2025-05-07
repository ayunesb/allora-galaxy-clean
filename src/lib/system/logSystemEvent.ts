import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Log a system event to the system_logs table
 * This function is designed to be resilient and never break the application
 * even if Supabase is unavailable
 */
export async function logSystemEvent(
  tenant_id: string,
  module: string,
  event: string,
  context?: Record<string, any>
): Promise<string | null> {
  // Store the event in memory if Supabase insert fails
  const eventData = {
    tenant_id,
    module,
    event,
    timestamp: new Date().toISOString(),
    context: context || null
  };
  
  try {
    // Try to insert the log into Supabase
    const { data, error } = await supabase
      .from('system_logs')
      .insert({
        tenant_id,
        module,
        event,
        context: context || null
      })
      .select('id')
      .single();

    if (error) {
      console.error("Error logging system event:", error);
      
      // Save to local storage as fallback if Supabase fails
      saveEventToLocalStorage(eventData);
      
      return null;
    }

    return data.id;
  } catch (error) {
    console.error("Unexpected error in logSystemEvent:", error);
    
    // Save to local storage as fallback
    saveEventToLocalStorage(eventData);
    
    // Try to sync local events when reconnected
    setTimeout(() => {
      syncLocalEventsToSupabase();
    }, 5000); // Try again in 5 seconds
    
    return null;
  }
}

/**
 * Save events to local storage when Supabase is unavailable
 */
function saveEventToLocalStorage(eventData: Record<string, any>): void {
  try {
    const pendingEvents = JSON.parse(localStorage.getItem('pendingSystemLogs') || '[]');
    pendingEvents.push(eventData);
    // Keep only the last 100 events to prevent storage issues
    if (pendingEvents.length > 100) {
      pendingEvents.splice(0, pendingEvents.length - 100);
    }
    localStorage.setItem('pendingSystemLogs', JSON.stringify(pendingEvents));
    console.info("Event saved to local storage:", eventData.event);
  } catch (err) {
    console.error("Could not save event to local storage:", err);
  }
}

/**
 * Attempt to sync locally stored events to Supabase when connection is available
 */
export async function syncLocalEventsToSupabase(): Promise<void> {
  try {
    const pendingEvents = JSON.parse(localStorage.getItem('pendingSystemLogs') || '[]');
    if (pendingEvents.length === 0) return;

    console.info(`Attempting to sync ${pendingEvents.length} pending system events...`);

    // Test connection with a simple query
    const { error: connectionError } = await supabase
      .from('system_logs')
      .select('count(*)', { count: 'exact', head: true });

    if (connectionError) {
      console.warn("Supabase still unavailable, will retry syncing events later");
      return;
    }

    // Connection is working, attempt to sync events
    for (let i = 0; i < pendingEvents.length; i++) {
      const event = pendingEvents[i];
      const { error } = await supabase
        .from('system_logs')
        .insert({
          tenant_id: event.tenant_id,
          module: event.module,
          event: event.event,
          context: event.context,
          // Use the original timestamp if available
          created_at: event.timestamp
        });

      if (!error) {
        // Remove successfully synced event
        pendingEvents.splice(i, 1);
        i--; // Adjust index since we removed an item
      }
    }

    // Update local storage with remaining events (if any)
    if (pendingEvents.length > 0) {
      localStorage.setItem('pendingSystemLogs', JSON.stringify(pendingEvents));
      console.info(`${pendingEvents.length} events still pending sync`);
    } else {
      localStorage.removeItem('pendingSystemLogs');
      console.info("All pending events synced successfully");
    }
  } catch (err) {
    console.error("Error syncing events to Supabase:", err);
  }
}

/**
 * Display an error notification to the user
 * This provides consistent error presentation across the application
 */
export function notifyError(title: string, description: string): void {
  // Log the error event
  logSystemEvent(
    "system", // We use "system" when tenant_id might not be available
    "error", 
    title,
    { description }
  );
  
  // Show toast notification to the user
  toast({
    variant: "destructive",
    title: title,
    description: description,
  });
}

/**
 * Display a success notification to the user
 */
export function notifySuccess(title: string, description: string): void {
  toast({
    title: title,
    description: description,
  });
}
