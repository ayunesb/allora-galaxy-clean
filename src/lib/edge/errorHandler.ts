
/**
 * Error handling utilities for edge functions
 */

// CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Standard error response interface
export interface ErrorResponseData {
  error: string;
  message?: string;
  details?: any;
  status: number;
  request_id?: string;
}

// Standard success response interface
export interface SuccessResponseData {
  data: any;
  status: number;
  message?: string;
  request_id?: string;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: Error | string,
  status: number = 500,
  details?: any,
  requestId?: string
): Response {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const responseBody: ErrorResponseData = {
    error: errorMessage,
    status,
    request_id: requestId || generateRequestId(),
  };
  
  if (details) {
    responseBody.details = details;
  }
  
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse(
  data: any,
  status: number = 200,
  message?: string,
  requestId?: string
): Response {
  const responseBody: SuccessResponseData = {
    data,
    status,
    request_id: requestId || generateRequestId(),
  };
  
  if (message) {
    responseBody.message = message;
  }
  
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Error handler for edge functions
 */
export function errorHandler(error: any): Response {
  console.error('Edge function error:', error);
  
  const status = error.status || 500;
  const message = error.message || 'Internal server error';
  
  return createErrorResponse(message, status);
}

/**
 * Handle execution errors in edge functions
 */
export function handleExecutionError(error: any, requestId?: string): Response {
  console.error(`Execution error [${requestId || 'no-id'}]:`, error);
  
  // Determine appropriate status code
  let status = 500;
  if (error.status) {
    status = error.status;
  } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-token') {
    status = 401;
  } else if (error.code === 'auth/permission-denied' || error.code === 'permission-denied') {
    status = 403;
  } else if (error.code === 'not-found') {
    status = 404;
  } else if (error.code === 'already-exists') {
    status = 409;
  }
  
  return createErrorResponse(
    error.message || 'Execution error',
    status,
    error.details || error.stack,
    requestId
  );
}
