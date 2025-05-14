
import { supabaseClient } from '@/lib/supabase';
import { SystemEventModule, LogSeverity } from '@/types/shared';

export default async function logSystemEvent(
  module: SystemEventModule | string,
  event: LogSeverity | string,
  context: any,
  tenant_id?: string
): Promise<void> {
  try {
    await supabaseClient
      .from('system_logs')
      .insert({
        module,
        event,
        context,
        tenant_id
      });
      
  } catch (error) {
    console.error('Error logging system event:', error);
    // We don't throw here to avoid causing issues with the main flow
  }
}

// Re-export for backwards compatibility
export { default as logSystemEvent } from './logSystemEvent';
