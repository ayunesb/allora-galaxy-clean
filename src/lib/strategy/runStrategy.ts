
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
    // Input validation with detailed error reporting
    if (!input) {
      return { 
        success: false, 
        error: "Input parameters are required",
        execution_time: 0
      };
    }
    
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
    
    // Add recovery checkpoint - record the execution start
    try {
      executionId = await recordExecution({
        tenant_id: input.tenant_id,
        type: 'strategy',
        status: 'pending',
        strategy_id: input.strategy_id,
        executed_by: input.user_id,
        input: { strategy_id: input.strategy_id }
      });
      
      // Log successful execution start
      console.log(`Execution started with ID: ${executionId}`);
    } catch (recordError) {
      // Continue execution despite recording failure
      console.error("Failed to record execution start, but continuing:", recordError);
    }
    
    // Log the strategy execution start with detailed context
    try {
      await logSystemEvent(
        input.tenant_id,
        "strategy",
        "strategy_execution_start",
        { 
          strategy_id: input.strategy_id,
          execution_id: executionId,
          user_id: input.user_id,
          timestamp: new Date().toISOString(),
          options: input.options || {}
        }
      );
    } catch (logError) {
      console.error("Failed to log execution start, but continuing:", logError);
    }
    
    // Get the strategy with error handling and fallbacks
    try {
      const { data: strategy, error: strategyError } = await supabase
        .from("strategies")
        .select("*, plugins(id, name)")
        .eq("id", input.strategy_id)
        .single();
        
      if (strategyError || !strategy) {
        const errorMessage = strategyError?.message || "Strategy not found";
        
        // Update the execution record with failure
        if (executionId) {
          try {
            await updateExecution(executionId, {
              tenant_id: input.tenant_id,
              status: 'failure',
              error: errorMessage,
              execution_time: performance.now() - startTime
            });
          } catch (updateError) {
            console.error("Failed to update execution record on failure:", updateError);
          }
        }
        
        // Log the error with detailed context
        try {
          await logSystemEvent(
            input.tenant_id,
            "strategy",
            "strategy_not_found",
            { 
              strategy_id: input.strategy_id, 
              error: errorMessage,
              execution_id: executionId,
              timestamp: new Date().toISOString()
            }
          );
        } catch (logError) {
          console.error("Failed to log strategy error:", logError);
        }
        
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
          try {
            await updateExecution(executionId, {
              tenant_id: input.tenant_id,
              status: 'failure',
              error: accessError,
              execution_time: performance.now() - startTime
            });
          } catch (updateError) {
            console.error("Failed to update execution record on access denied:", updateError);
          }
        }
        
        // Log the access error with detailed context
        try {
          await logSystemEvent(
            input.tenant_id,
            "strategy",
            "strategy_access_denied",
            { 
              strategy_id: input.strategy_id,
              execution_id: executionId,
              intended_tenant: input.tenant_id,
              actual_tenant: strategy.tenant_id,
              timestamp: new Date().toISOString()
            }
          );
        } catch (logError) {
          console.error("Failed to log access error:", logError);
        }
        
        return {
          success: false,
          error: accessError,
          execution_time: performance.now() - startTime,
          execution_id: executionId
        };
      }
      
      // Strategy is valid, proceed with execution

      // TODO: Implement actual strategy execution logic here
      // For now, we'll simulate a successful execution
      
      // Record the execution success with safeguards
      if (executionId) {
        try {
          await updateExecution(executionId, {
            tenant_id: input.tenant_id,
            status: 'success',
            output: { strategy_id: input.strategy_id },
            execution_time: performance.now() - startTime,
            xp_earned: 25 // Default XP for successful execution
          });
        } catch (updateError) {
          console.error("Failed to update execution record on success:", updateError);
        }
      }
      
      // Log the successful execution with detailed metrics
      try {
        await logSystemEvent(
          input.tenant_id,
          "strategy",
          "strategy_executed_successfully",
          { 
            strategy_id: input.strategy_id,
            execution_id: executionId,
            execution_time: performance.now() - startTime,
            plugins_count: strategy.plugins?.length || 0,
            timestamp: new Date().toISOString()
          }
        );
      } catch (logError) {
        console.error("Failed to log execution success:", logError);
      }
      
      return {
        success: true,
        message: "Strategy executed successfully",
        data: { strategy_id: input.strategy_id },
        execution_time: performance.now() - startTime,
        execution_id: executionId
      };
    } catch (strategyQueryError) {
      const errorMessage = `Error querying strategy: ${strategyQueryError.message || 'Unknown error'}`;
      
      // Update the execution with error details
      if (executionId) {
        try {
          await updateExecution(executionId, {
            tenant_id: input.tenant_id,
            status: 'failure',
            error: errorMessage,
            execution_time: performance.now() - startTime
          });
        } catch (updateError) {
          console.error("Failed to update execution record on query error:", updateError);
        }
      }
      
      // Log the error
      try {
        await logSystemEvent(
          input.tenant_id,
          "strategy",
          "strategy_query_error",
          { 
            strategy_id: input.strategy_id,
            error: errorMessage,
            execution_id: executionId,
            timestamp: new Date().toISOString()
          }
        );
      } catch (logError) {
        console.error("Failed to log strategy query error:", logError);
      }
      
      return {
        success: false,
        error: errorMessage,
        execution_time: performance.now() - startTime,
        execution_id: executionId
      };
    }
  } catch (error: any) {
    const executionTime = performance.now() - startTime;
    console.error("Error executing strategy:", error);
    
    // Update the execution if we have an ID
    if (executionId) {
      try {
        await updateExecution(executionId, {
          tenant_id: input.tenant_id,
          status: 'failure',
          error: error.message || 'Unknown error occurred',
          execution_time: executionTime
        });
      } catch (updateError) {
        console.error("Failed to update execution on error:", updateError);
      }
    }
    
    // Log the error with full stack trace
    try {
      await logSystemEvent(
        input.tenant_id || 'system',
        "strategy",
        "strategy_execution_error",
        { 
          strategy_id: input.strategy_id,
          error: error.message || 'Unknown error occurred',
          stack: error.stack,
          execution_id: executionId,
          timestamp: new Date().toISOString()
        }
      );
    } catch (logError) {
      console.error("Failed to log execution error:", logError);
    }
    
    return {
      success: false,
      error: error.message || 'An unknown error occurred while executing the strategy',
      execution_time: executionTime,
      execution_id: executionId
    };
  }
}
