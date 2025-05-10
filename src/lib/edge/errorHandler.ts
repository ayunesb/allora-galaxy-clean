
/**
 * Standardized error handling utilities for edge functions
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

export interface ErrorResponseData {
  error: string;
  message?: string;
  details?: any;
  timestamp?: string;
  request_id?: string;
}

export interface SuccessResponseData {
  success: boolean;
  data?: any;
  message?: string;
  timestamp?: string;
  execution_time?: number;
}

/**
 * Generate a unique request ID for tracking
 */
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  status: number, 
  message: string, 
  details?: any, 
  startTime?: number
): Response {
  const executionTime = startTime ? (performance.now() - startTime) / 1000 : undefined;
  
  const errorResponse: ErrorResponseData = {
    error: message,
    details: details,
    timestamp: new Date().toISOString(),
    request_id: generateRequestId()
  };
  
  return new Response(
    JSON.stringify({
      ...errorResponse,
      execution_time: executionTime
    }),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse(
  data: any,
  message?: string,
  startTime?: number
): Response {
  const executionTime = startTime ? (performance.now() - startTime) / 1000 : undefined;
  
  const successResponse: SuccessResponseData = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    execution_time: executionTime
  };
  
  return new Response(
    JSON.stringify(successResponse),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflightRequest(): Response {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Handle execution errors in edge functions
 */
export function handleExecutionError(
  error: any,
  startTime?: number,
  module?: string
): Response {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`Error in ${module || 'edge function'}:`, error);
  
  return createErrorResponse(
    500,
    "Internal server error occurred",
    errorMessage,
    startTime
  );
}
