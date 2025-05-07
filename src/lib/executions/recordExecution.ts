
import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { ExecutionRecordInput, ExecutionStatus, SystemLogModule } from "@/types/fixed";
import { camelToSnake } from "@/types/fixed";

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
    if (!input.tenantId) {
      console.error("recordExecution: Missing required tenantId");
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
      // Convert camelCase to snake_case for Supabase
      const snakeCaseInput = camelToSnake(input);

      const { data, error } = await supabase
        .from("executions")
        .insert(snakeCaseInput)
        .select("id")
        .single();

      if (error) {
        // Log detailed error but continue with fallback mechanisms
        console.error("Error recording execution:", error);
        
        try {
          // Log to system logs as fallback with detailed context
          await logSystemEvent(
            input.tenantId,
            "executions" as SystemLogModule,
            "execution_record_failed",
            {
              type: input.type,
              status,
              strategyId: input.strategyId,
              pluginId: input.pluginId,
              errorCode: error.code,
              errorMessage: error.message,
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
          input.tenantId,
          "executions" as SystemLogModule,
          "execution_record_db_error",
          {
            type: input.type,
            status,
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
        input.tenantId,
        "executions" as SystemLogModule,
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
 * @param executionId The ID of the execution to update
 * @param updates The fields to update
 * @returns Boolean indicating success
 */
export async function updateExecution(
  executionId: string,
  updates: Partial<ExecutionRecordInput> & { status?: ExecutionStatus }
): Promise<boolean> {
  try {
    // Input validation with detailed error reporting
    if (!executionId) {
      console.error("updateExecution: Missing executionId");
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
    if (updates.executionTime !== undefined) updateObject.execution_time = updates.executionTime;
    if (updates.xpEarned !== undefined) updateObject.xp_earned = updates.xpEarned;

    // Update execution with error handling
    const { error } = await supabase
      .from("executions")
      .update(updateObject)
      .eq("id", executionId);

    if (error) {
      console.error("Error updating execution record:", error);
      
      try {
        // Log update failure if tenant ID is available
        if (updates.tenantId) {
          await logSystemEvent(
            updates.tenantId,
            "executions" as SystemLogModule,
            "execution_update_failed",
            {
              executionId,
              errorCode: error.code,
              errorMessage: error.message,
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
    console.log(`Execution ${executionId} updated successfully`);
    
    return true;
  } catch (error: any) {
    // Handle all unexpected errors
    console.error("Unexpected error in updateExecution:", error);
    
    try {
      // Log update exception if tenant ID is available
      if (updates.tenantId) {
        await logSystemEvent(
          updates.tenantId,
          "executions" as SystemLogModule,
          "execution_update_exception",
          {
            executionId,
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
 * @param executionId The ID of the execution to retrieve
 * @returns The execution record or null if not found
 */
export async function getExecution(executionId: string): Promise<any | null> {
  try {
    // Input validation
    if (!executionId) {
      console.error("getExecution: Missing executionId");
      return null;
    }

    // Retrieve execution with error handling
    const { data, error } = await supabase
      .from("executions")
      .select("*")
      .eq("id", executionId)
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
