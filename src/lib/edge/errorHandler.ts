
import { corsHeaders } from '@/lib/env';

export interface ErrorResponseData {
  success: false;
  error: string;
  details?: any;
  timestamp: string;
  code?: string;
  requestId?: string;
}

export interface SuccessResponseData {
  success: true;
  timestamp: string;
  [key: string]: any;
}

/**
 * Generate a unique request ID for tracking
 * @returns Unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Error handler for edge functions
 * @param err The error object
 * @param requestId Optional request ID for tracking
 * @returns A JSON response with the error message and a 500 status code
 */
export function errorHandler(err: any, requestId?: string): Response {
  console.error(`Edge Function Error${requestId ? ` [${requestId}]` : ''}:`, err);
  
  const message = err?.message || 'Internal Server Error';
  const status = err?.status || 500;
  const code = err?.code || 'INTERNAL_ERROR';
  
  const responseData: ErrorResponseData = { 
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };
  
  if (err?.details) {
    responseData.details = err.details;
  }
  
  if (code) {
    responseData.code = code;
  }
  
  if (requestId) {
    responseData.requestId = requestId;
  }
  
  return new Response(
    JSON.stringify(responseData),
    { 
      status: status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

/**
 * Create a standardized success response for edge functions
 * @param data Response data
 * @param status HTTP status code
 * @returns Success response
 */
export function createSuccessResponse(data: Record<string, any> = {}, status: number = 200): Response {
  const responseData: SuccessResponseData = {
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  };
  
  return new Response(
    JSON.stringify(responseData),
    { 
      status: status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

/**
 * Create a standardized error response for edge functions
 * @param message Error message
 * @param details Additional error details
 * @param status HTTP status code
 * @param code Error code
 * @param requestId Optional request ID for tracking
 * @returns Error response
 */
export function createErrorResponse(
  message: string, 
  details?: any, 
  status: number = 500,
  code?: string,
  requestId?: string
): Response {
  const responseData: ErrorResponseData = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };
  
  if (details !== undefined) {
    responseData.details = details;
  }
  
  if (code) {
    responseData.code = code;
  }
  
  if (requestId) {
    responseData.requestId = requestId;
  }
  
  return new Response(
    JSON.stringify(responseData),
    { 
      status: status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

/**
 * Handle CORS preflight requests
 * @returns Response for OPTIONS requests with CORS headers
 */
export function handleCorsPreflightRequest(): Response {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Handle errors that occur during strategy execution
 * @param error The error that occurred
 * @param requestStart The timestamp when the request started
 * @returns An error response
 */
export function handleExecutionError(error: any, requestStart: number): Response {
  const requestId = generateRequestId();
  console.error(`Execution error [${requestId}]:`, error);
  
  const executionTime = (performance.now() - requestStart) / 1000;
  
  return createErrorResponse(
    error?.message || 'Unexpected error during execution',
    {
      execution_time: executionTime,
      stack: error?.stack ? error.stack.split('\n').slice(0, 3).join('\n') : undefined
    },
    error?.status || 500,
    error?.code || 'EXECUTION_ERROR',
    requestId
  );
}

export { corsHeaders };
