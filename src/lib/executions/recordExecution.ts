
import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { ExecutionRecordInput } from "@/types/functions";

/**
 * Records an execution in the database with fallback mechanisms
 * and comprehensive error handling
 * 
 * @param input The execution record data
 * @returns The ID of the created execution record or null if failed
 */
export async function recordExecution(input: ExecutionRecordInput): Promise<string | null> {
  try {
    // Validate required fields
    if (!input.tenant_id) {
      console.error("recordExecution: Missing required tenant_id");
      return null;
    }

    if (!input.type) {
      console.error("recordExecution: Missing required type");
      return null;
    }

    // Insert execution record
    const { data, error } = await supabase
      .from("executions")
      .insert({
        tenant_id: input.tenant_id,
        strategy_id: input.strategy_id,
        plugin_id: input.plugin_id,
        agent_version_id: input.agent_version_id,
        executed_by: input.executed_by,
        type: input.type,
        status: input.status || 'pending',
        input: input.input,
        output: input.output,
        error: input.error,
        execution_time: input.execution_time,
        xp_earned: input.xp_earned
      })
      .select("id")
      .single();

    if (error) {
      // Log error but don't fail the operation
      console.error("Error recording execution:", error);
      
      try {
        // Log to system logs as fallback
        await logSystemEvent(
          input.tenant_id,
          "executions",
          "execution_record_failed",
          {
            type: input.type,
            status: input.status,
            strategy_id: input.strategy_id,
            plugin_id: input.plugin_id,
            error: error.message
          }
        );
      } catch (logError) {
        console.error("Failed to log execution failure:", logError);
      }
      
      return null;
    }

    return data?.id || null;
  } catch (error: any) {
    console.error("Unexpected error in recordExecution:", error);
    
    try {
      // Attempt to log to system logs
      await logSystemEvent(
        input.tenant_id,
        "executions",
        "execution_record_exception",
        {
          type: input.type,
          status: input.status,
          error: error.message || "Unknown error"
        }
      );
    } catch {
      // Silent catch - we've already logged to console
    }
    
    return null;
  }
}

/**
 * Updates an existing execution record
 * 
 * @param execution_id The ID of the execution to update
 * @param updates The fields to update
 * @returns Boolean indicating success
 */
export async function updateExecution(
  execution_id: string,
  updates: Partial<ExecutionRecordInput> & { status?: string }
): Promise<boolean> {
  try {
    if (!execution_id) {
      console.error("updateExecution: Missing execution_id");
      return false;
    }

    const { error } = await supabase
      .from("executions")
      .update({
        status: updates.status,
        output: updates.output,
        error: updates.error,
        execution_time: updates.execution_time,
        xp_earned: updates.xp_earned,
        updated_at: new Date().toISOString()
      })
      .eq("id", execution_id);

    if (error) {
      console.error("Error updating execution record:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in updateExecution:", error);
    return false;
  }
}
