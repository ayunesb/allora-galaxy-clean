import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
  | 'email'
  | 'onboarding';

// Define the log levels
export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

// Type for structured log input
export interface SystemLogInput {
  module?: SystemEventModule;
  event?: string;
  description?: string;
  tenant_id?: string;
  context?: Record<string, any>;
  [key: string]: any; // For additional properties
}

/**
 * Log a system event to the Supabase system_logs table
 * Supports both string description and structured object input
 * 
 * @param module The system module generating the log
 * @param event The specific event name
 * @param data Description string or structured data object
 * @param tenantId The tenant ID (if applicable)
 * @param context Additional contextual data (will be stored as JSON)
 * @returns Promise with the log result
 */
export async function logSystemEvent(
  module: SystemEventModule,
  event: string,
  data: string | Record<string, any>,
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
    
    // Process the data parameter to handle both string and object formats
    let description: string;
    let combinedContext: Record<string, any> = {};
    
    if (typeof data === 'string') {
      description = data;
      combinedContext = context;
    } else {
      // If data is an object, extract a description and use the object as context
      description = data.description || data.message || JSON.stringify(data).substring(0, 255);
      combinedContext = { ...data, ...context };
      
      // Remove duplicate description from context if it exists
      if (combinedContext.description === description) {
        delete combinedContext.description;
      }
    }
    
    // Insert log into database
    const { error } = await supabase
      .from('system_logs')
      .insert({
        module,
        event,
        description,
        tenant_id: tenantId,
        context: combinedContext,
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
          description: typeof data === 'string' ? data : JSON.stringify(data).substring(0, 255),
          tenant_id: tenantId,
          context: typeof data === 'string' ? context : { ...data, ...context },
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

/**
 * Log a system event and show a toast notification
 * @param module System module
 * @param level Log level
 * @param title Toast title
 * @param description Toast description
 * @param type Toast variant
 * @param contextData Additional context for the log
 */
export function logSystemEventWithToast(
  module: SystemEventModule,
  level: LogLevel,
  title: string,
  description: string,
  type: 'default' | 'destructive',
  contextData: Record<string, any> = {}
) {
  // Show toast notification
  toast({
    title,
    description,
    variant: type
  });
  
  // Log event to system logs
  logSystemEvent(
    module, 
    `${level}_${title.toLowerCase().replace(/\s+/g, '_')}`, 
    description,
    contextData.tenant_id || 'system',
    contextData
  );
}

export default logSystemEvent;
