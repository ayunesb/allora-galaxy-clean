
/**
 * Error handling utilities for edge functions
 */

// CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};

// Standard error response interface
export interface ErrorResponseData {
  error: string;
  message?: string;
  details?: any;
  status: number;
  request_id?: string;
  timestamp?: string;
  code?: string;
}

// Standard success response interface
export interface SuccessResponseData {
  data: any;
  status: number;
  message?: string;
  request_id?: string;
  timestamp?: string;
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
    timestamp: new Date().toISOString(),
  };
  
  if (details) {
    responseBody.details = details;
  }
  
  // Add error code if it exists
  if (typeof error !== 'string' && (error as any).code) {
    responseBody.code = (error as any).code;
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
    timestamp: new Date().toISOString(),
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
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }
  return null;
}

/**
 * Universal error handler for edge functions
 */
export function errorHandler(error: any, requestId?: string): Response {
  console.error(`Edge function error [${requestId || 'no-id'}]:`, error);
  
  const status = error.status || 500;
  const message = error.message || 'Internal server error';
  
  return createErrorResponse(message, status, undefined, requestId);
}

/**
 * Handle execution errors in edge functions with detailed logging
 */
export function handleExecutionError(error: any, requestId?: string): Response {
  console.error(`Execution error [${requestId || 'no-id'}]:`, error);
  
  // Determine appropriate status code based on error type/code
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
  } else if (error.code === 'resource-exhausted') {
    status = 429;
  }
  
  return createErrorResponse(
    error.message || 'Execution error',
    status,
    error.details || error.stack,
    requestId
  );
}

/**
 * Safe wrapper for edge function execution
 * @param handler The function handler to execute
 * @param requestId Optional request ID for tracking
 * @returns The response from the handler or an error response
 */
export async function safeExecute<T>(
  handler: () => Promise<T>, 
  requestId?: string
): Promise<T | Response> {
  try {
    return await handler();
  } catch (error) {
    return handleExecutionError(error, requestId);
  }
}

/**
 * Safely parse JSON request body with error handling
 * @param req The request object
 * @returns Tuple containing [parsed data, error]
 */
export async function safeParseJsonBody<T>(req: Request): Promise<[T | null, Error | null]> {
  try {
    const body = await req.json() as T;
    return [body, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
