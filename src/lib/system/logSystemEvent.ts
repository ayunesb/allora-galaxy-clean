
import { supabase } from "@/integrations/supabase/client";

/**
 * Log a system event to the system_logs table
 */
export async function logSystemEvent(
  tenant_id: string,
  module: string,
  event: string,
  context?: Record<string, any>
): Promise<string | null> {
  try {
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
      return null;
    }

    return data.id;
  } catch (error) {
    console.error("Unexpected error in logSystemEvent:", error);
    return null;
  }
}
