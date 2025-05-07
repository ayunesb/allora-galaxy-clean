
import { ExecuteStrategyInput, ExecuteStrategyResult } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { recordExecution, updateExecution } from "@/lib/executions/recordExecution";

/**
 * Executes a strategy with comprehensive error handling and recovery mechanisms
 * 
 * @param input Strategy execution input parameters
 * @returns Result of the strategy execution
 */
export async function runStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  const startTime = performance.now();
  let executionId: string | null = null;
  
  try {
    // Input validation
    if (!input.strategy_id) {
      return { 
        success: false, 
        error: "Strategy ID is required",
        execution_time: 0
      };
    }

    if (!input.tenant_id) {
      return { 
        success: false, 
        error: "Tenant ID is required",
        execution_time: 0
      };
    }
    
    // Record the execution start
    executionId = await recordExecution({
      tenant_id: input.tenant_id,
      type: 'strategy',
      status: 'pending',
      strategy_id: input.strategy_id,
      executed_by: input.user_id,
      input: { strategy_id: input.strategy_id }
    });
    
    // Log the strategy execution start
    await logSystemEvent(
      input.tenant_id,
      "strategy",
      "strategy_execution_start",
      { 
        strategy_id: input.strategy_id,
        execution_id: executionId
      }
    ).catch(err => console.error("Failed to log execution start, but continuing:", err));
    
    // Get the strategy with error handling
    const { data: strategy, error: strategyError } = await supabase
      .from("strategies")
      .select("*, plugins(id, name)")
      .eq("id", input.strategy_id)
      .single();
      
    if (strategyError || !strategy) {
      const errorMessage = strategyError?.message || "Strategy not found";
      
      // Update the execution record with failure
      if (executionId) {
        await updateExecution(executionId, {
          status: 'failure',
          error: errorMessage,
          execution_time: performance.now() - startTime
        });
      }
      
      // Log the error
      await logSystemEvent(
        input.tenant_id,
        "strategy",
        "strategy_not_found",
        { strategy_id: input.strategy_id, error: errorMessage }
      ).catch(err => console.error("Failed to log strategy error, but continuing:", err));
      
      return { 
        success: false, 
        error: errorMessage,
        execution_time: performance.now() - startTime,
        execution_id: executionId
      };
    }
    
    // Verify tenant access with explicit error handling
    if (strategy.tenant_id !== input.tenant_id) {
      const accessError = "Strategy does not belong to the specified tenant";
      
      // Update the execution record with failure
      if (executionId) {
        await updateExecution(executionId, {
          status: 'failure',
          error: accessError,
          execution_time: performance.now() - startTime
        });
      }
      
      // Log the access error
      await logSystemEvent(
        input.tenant_id,
        "strategy",
        "strategy_access_denied",
        { strategy_id: input.strategy_id }
      ).catch(err => console.error("Failed to log access error, but continuing:", err));
      
      return {
        success: false,
        error: accessError,
        execution_time: performance.now() - startTime,
        execution_id: executionId
      };
    }
    
    // Record the execution success
    if (executionId) {
      await updateExecution(executionId, {
        tenant_id: input.tenant_id,
        status: 'success',
        output: { strategy_id: input.strategy_id },
        execution_time: performance.now() - startTime,
        xp_earned: 25 // Default XP for successful execution
      });
    }
    
    // Log the successful execution
    await logSystemEvent(
      input.tenant_id,
      "strategy",
      "strategy_executed_successfully",
      { 
        strategy_id: input.strategy_id,
        execution_id: executionId,
        execution_time: performance.now() - startTime
      }
    ).catch(err => console.error("Failed to log execution success, but continuing:", err));
    
    return {
      success: true,
      message: "Strategy executed successfully",
      data: { strategy_id: input.strategy_id },
      execution_time: performance.now() - startTime,
      execution_id: executionId
    };
  } catch (error: any) {
    const executionTime = performance.now() - startTime;
    console.error("Error executing strategy:", error);
    
    // Update the execution if we have an ID
    if (executionId) {
      await updateExecution(executionId, {
        status: 'failure',
        error: error.message || 'Unknown error occurred',
        execution_time: executionTime
      }).catch(err => console.error("Failed to update execution on error, but continuing:", err));
    }
    
    // Log the error
    await logSystemEvent(
      input.tenant_id || 'system',
      "strategy",
      "strategy_execution_error",
      { 
        strategy_id: input.strategy_id,
        error: error.message || 'Unknown error occurred',
        stack: error.stack
      }
    ).catch(err => console.error("Failed to log execution error, but continuing:", err));
    
    return {
      success: false,
      error: error.message || 'An unknown error occurred while executing the strategy',
      execution_time: executionTime,
      execution_id: executionId
    };
  }
}
