
import { supabase } from '@/integrations/supabase/client';
import { LogSeverity } from '@/types/shared';

/**
 * Log a system event to the database
 * 
 * @param module The module generating the event
 * @param severity The severity level (info, warning, error)
 * @param context Additional context information
 * @param tenantId Optional tenant ID
 */
export async function logSystemEvent(
  module: string,
  severity: LogSeverity,
  context: Record<string, any> = {},
  tenantId?: string
): Promise<void> {
  try {
    // Create the log entry
    await supabase
      .from('system_logs')
      .insert({
        module,
        event: severity,
        context,
        tenant_id: tenantId
      });
      
  } catch (error) {
    // Don't throw, just log to console since this is a logging function
    console.error('Failed to log system event:', error);
  }
}
