
import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";

/**
 * Interface for execution record input
 */
export interface ExecutionRecordInput {
  tenant_id: string;
  strategy_id?: string;
  plugin_id?: string;
  agent_version_id?: string;
  executed_by?: string;
  type: string;
  status?: string;
  input?: any;
  output?: any;
  error?: any;
  execution_time?: number;
  xp_earned?: number;
}

/**
 * Records an execution in the database with fallback mechanisms
 * and comprehensive error handling
 * 
 * @param input The execution record data
 * @returns The ID of the created execution record or null if failed
 */
export async function recordExecution(input: ExecutionRecordInput): Promise<string | null> {
  try {
    // Validate required fields with detailed error messages
    if (!input.tenant_id) {
      console.error("recordExecution: Missing required tenant_id");
      return null;
    }

    if (!input.type) {
      console.error("recordExecution: Missing required type");
      return null;
    }

    // Ensure status has a valid default
    const status = input.status || 'pending';

    // Insert execution record with comprehensive error handling
    try {
      const { data, error } = await supabase
        .from("executions")
        .insert({
          tenant_id: input.tenant_id,
          strategy_id: input.strategy_id,
          plugin_id: input.plugin_id,
          agent_version_id: input.agent_version_id,
          executed_by: input.executed_by,
          type: input.type,
          status: status,
          input: input.input || {},
          output: input.output,
          error: input.error,
          execution_time: input.execution_time,
          xp_earned: input.xp_earned
        })
        .select("id")
        .single();

      if (error) {
        // Log detailed error but continue with fallback mechanisms
        console.error("Error recording execution:", error);
        
        try {
          // Log to system logs as fallback with detailed context
          await logSystemEvent(
            input.tenant_id,
            "executions",
            "execution_record_failed",
            {
              type: input.type,
              status: status,
              strategy_id: input.strategy_id,
              plugin_id: input.plugin_id,
              error_code: error.code,
              error_message: error.message,
              timestamp: new Date().toISOString()
            }
          );
        } catch (logError) {
          console.error("Failed to log execution failure:", logError);
        }
        
        return null;
      }

      // Log successful execution record
      console.log(`Execution recorded successfully: ${data?.id}`);
      
      return data?.id || null;
    } catch (dbError: any) {
      // Handle unexpected database errors
      console.error("Database error in recordExecution:", dbError);
      
      try {
        // Attempt fallback logging
        await logSystemEvent(
          input.tenant_id,
          "executions",
          "execution_record_db_error",
          {
            type: input.type,
            status: status,
            error: dbError.message || "Unknown database error",
            stack: dbError.stack,
            timestamp: new Date().toISOString()
          }
        );
      } catch {
        // Silent catch - we've already logged to console
      }
      
      return null;
    }
  } catch (error: any) {
    // Catch all unexpected errors
    console.error("Unexpected error in recordExecution:", error);
    
    try {
      // Attempt to log to system logs with error details
      await logSystemEvent(
        input.tenant_id,
        "executions",
        "execution_record_exception",
        {
          type: input.type,
          status: input.status,
          error: error.message || "Unknown error",
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      );
    } catch {
      // Silent catch - we've already logged to console
    }
    
    return null;
  }
}

/**
 * Updates an existing execution record with comprehensive error handling
 * and detailed logging
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
    // Input validation with detailed error reporting
    if (!execution_id) {
      console.error("updateExecution: Missing execution_id");
      return false;
    }

    // Prepare update object with null checking for each field
    const updateObject: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    // Only add defined fields to the update object
    if (updates.status !== undefined) updateObject.status = updates.status;
    if (updates.output !== undefined) updateObject.output = updates.output;
    if (updates.error !== undefined) updateObject.error = updates.error;
    if (updates.execution_time !== undefined) updateObject.execution_time = updates.execution_time;
    if (updates.xp_earned !== undefined) updateObject.xp_earned = updates.xp_earned;

    // Update execution with error handling
    const { error } = await supabase
      .from("executions")
      .update(updateObject)
      .eq("id", execution_id);

    if (error) {
      console.error("Error updating execution record:", error);
      
      try {
        // Log update failure if tenant ID is available
        if (updates.tenant_id) {
          await logSystemEvent(
            updates.tenant_id,
            "executions",
            "execution_update_failed",
            {
              execution_id,
              error_code: error.code,
              error_message: error.message,
              timestamp: new Date().toISOString()
            }
          );
        }
      } catch (logError) {
        console.error("Failed to log execution update failure:", logError);
      }
      
      return false;
    }

    // Log successful update
    console.log(`Execution ${execution_id} updated successfully`);
    
    return true;
  } catch (error: any) {
    // Handle all unexpected errors
    console.error("Unexpected error in updateExecution:", error);
    
    try {
      // Log update exception if tenant ID is available
      if (updates.tenant_id) {
        await logSystemEvent(
          updates.tenant_id,
          "executions",
          "execution_update_exception",
          {
            execution_id,
            error: error.message || "Unknown error",
            stack: error.stack,
            timestamp: new Date().toISOString()
          }
        );
      }
    } catch {
      // Silent catch - we've already logged to console
    }
    
    return false;
  }
}

/**
 * Retrieves execution details with comprehensive error handling
 * 
 * @param execution_id The ID of the execution to retrieve
 * @returns The execution record or null if not found
 */
export async function getExecution(execution_id: string): Promise<any | null> {
  try {
    // Input validation
    if (!execution_id) {
      console.error("getExecution: Missing execution_id");
      return null;
    }

    // Retrieve execution with error handling
    const { data, error } = await supabase
      .from("executions")
      .select("*")
      .eq("id", execution_id)
      .maybeSingle();

    if (error) {
      console.error("Error retrieving execution record:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in getExecution:", error);
    return null;
  }
}
