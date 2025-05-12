
import { supabase } from '@/lib/supabase';
import { SystemEventModule, SystemEventType } from '@/types/shared';

/**
 * Log a system event to the database
 * 
 * @param module The system module generating the event
 * @param event The type of event
 * @param context Optional context data
 * @param tenantId Optional tenant ID
 * @returns Result of the logging operation
 */
export async function logSystemEvent(
  module: SystemEventModule,
  event: string,
  context?: Record<string, any>,
  tenantId?: string
): Promise<{success: boolean, error?: string, id?: string}> {
  try {
    // Create the log entry
    const logEntry = {
      module,
      event,
      context,
      tenant_id: tenantId
    };

    // Insert into system_logs table
    const { data, error } = await supabase
      .from('system_logs')
      .insert(logEntry)
      .select('id')
      .single();

    if (error) {
      console.error('Error logging system event:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to log system event'
      };
    }

    return { 
      success: true,
      id: data?.id
    };
  } catch (err: any) {
    console.error('Exception logging system event:', err);
    return { 
      success: false, 
      error: err.message || 'Exception occurred logging system event'
    };
  }
}

/**
 * Log an error event to the system logs
 * 
 * @param module The system module generating the error
 * @param error The error object or message
 * @param context Additional context data
 * @param tenantId Optional tenant ID
 * @returns Result of the logging operation
 */
export async function logSystemError(
  module: SystemEventModule,
  error: Error | string,
  context?: Record<string, any>,
  tenantId?: string
): Promise<{success: boolean, error?: string, id?: string}> {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  const errorContext = {
    ...context,
    error: errorMessage,
    stack: errorStack
  };

  return logSystemEvent(module, 'error', errorContext, tenantId);
}

/**
 * Log an info event to the system logs
 *
 * @param module The system module generating the info event
 * @param message The info message
 * @param context Additional context data
 * @param tenantId Optional tenant ID
 * @returns Result of the logging operation
 */
export async function logSystemInfo(
  module: SystemEventModule,
  message: string,
  context?: Record<string, any>,
  tenantId?: string
): Promise<{success: boolean, error?: string, id?: string}> {
  const infoContext = {
    ...context,
    message
  };

  return logSystemEvent(module, 'info', infoContext, tenantId);
}

// Default export for backward compatibility with existing code
export default logSystemEvent;
