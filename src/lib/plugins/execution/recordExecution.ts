import { supabase } from "@/integrations/supabase/client";
import { ExecutionRecordInput } from "@/types/execution";
import { logSystemEvent } from "@/lib/system/logSystemEvent";

/**
 * Record an execution in the database for tracking and analysis
 *
 * This function creates a new execution record in the database with details about
 * a plugin, strategy, or agent execution. It handles the conversion of camelCase
 * properties to snake_case for database compatibility and provides error handling.
 *
 * @param data The execution data to record
 * @returns Promise resolving to an object indicating success or failure
 *
 * @example
 * ```typescript
 * // Record a plugin execution
 * const result = await recordExecution({
 *   tenantId: 'tenant-123',
 *   type: 'plugin',
 *   pluginId: 'plugin-456',
 *   status: 'success',
 *   executedBy: 'user-789',
 *   input: { param1: 'value1' },
 *   output: { result: 'processed data' },
 *   executionTime: 1250, // ms
 *   xpEarned: 10
 * });
 *
 * if (result.success) {
 *   console.log('Execution recorded:', result.data);
 * } else {
 *   console.error('Failed to record execution:', result.error);
 * }
 * ```
 */
export async function recordExecution(data: ExecutionRecordInput) {
  try {
    // Convert camelCase keys to snake_case for the database
    const record = {
      tenant_id: data.tenantId,
      status: data.status,
      type: data.type,
      strategy_id: data.strategyId,
      plugin_id: data.pluginId,
      agent_version_id: data.agentVersionId,
      executed_by: data.executedBy,
      input: data.input,
      output: data.output,
      execution_time: data.executionTime,
      xp_earned: data.xpEarned,
      error: data.error,
    };

    const { data: execution, error } = await supabase
      .from("executions")
      .insert(record)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: execution,
    };
  } catch (error: any) {
    console.error("Error recording execution:", error);

    // Try to log the error as a system event
    try {
      await logSystemEvent(
        "system",
        "error",
        {
          description: `Failed to record execution: ${error.message}`,
          action: "record_execution",
          error: error.message,
          details: data,
        },
        data.tenantId,
      );
    } catch (logError) {
      console.error("Failed to log execution error:", logError);
    }

    return {
      success: false,
      error: error.message || "Unknown error recording execution",
    };
  }
}
