
import { createErrorResponse, createSuccessResponse, corsHeaders } from "../_shared/edgeUtils/index.ts";

export { createErrorResponse, createSuccessResponse, corsHeaders };

/**
 * Handle unexpected errors in the execution process
 * @param error The error that occurred
 * @param startTime Performance measurement start time
 * @param executionId Optional execution ID for tracking
 * @param strategyId Optional strategy ID for context
 * @returns Standardized error response
 */
export function handleExecutionError(
  error: any, 
  startTime: number,
  executionId?: string,
  strategyId?: string
): Response {
  console.error("Unexpected error in strategy execution:", error);
  
  // Calculate total request duration
  const requestDuration = (performance.now() - startTime) / 1000;
  
  return new Response(
    JSON.stringify({ 
      success: false,
      error: "Unexpected server error", 
      details: String(error),
      request_duration: requestDuration,
      execution_id: executionId,
      strategy_id: strategyId
    }), 
    { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}
