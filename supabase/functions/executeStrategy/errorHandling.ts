
import { corsHeaders } from "./validation.ts";

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string, 
  details?: any, 
  status: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse(data: any): Response {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
      timestamp: new Date().toISOString()
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

/**
 * Safely handle unhandled errors in the execution
 */
export function handleExecutionError(
  error: any, 
  startTime: number,
  executionId?: string,
  strategyId?: string
): Response {
  console.error("Unexpected error:", error);
  
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
