
import { corsHeaders } from '@/lib/env/environment';

/**
 * Standard error response format for edge functions
 */
export interface ErrorResponseData {
  success: false;
  error: string;
  details?: any;
  timestamp: string;
  code?: string;
  requestId?: string;
  status: number;
}

/**
 * Standard success response format for edge functions
 */
export interface SuccessResponseData<T = any> {
  success: true;
  data: T;
  timestamp: string;
  requestId?: string;
}

/**
 * Error handler for edge functions
 * @param err The error object
 * @param requestId Optional request ID for tracking
 * @returns A JSON response with the error message
 */
export function handleEdgeFunctionError(err: any, requestId?: string): Response {
  // Log the error for debugging
  console.error(`Edge Function Error${requestId ? ` [${requestId}]` : ''}:`, err);
  
  // Extract error details
  const message = err?.message || 'Internal Server Error';
  const status = err?.status || 500;
  const code = err?.code || 'INTERNAL_ERROR';
  const details = err?.details || undefined;
  
  // Create standardized error response
  const responseData: ErrorResponseData = { 
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    status
  };
  
  if (details) {
    responseData.details = details;
  }
  
  if (code) {
    responseData.code = code;
  }
  
  if (requestId) {
    responseData.requestId = requestId;
  }
  
  // Return formatted error response
  return new Response(
    JSON.stringify(responseData),
    { 
      status,
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
 * @param requestId Optional request ID for tracking
 * @returns Success response
 */
export function createSuccessResponse<T>(data: T, status: number = 200, requestId?: string): Response {
  const responseData: SuccessResponseData<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
  
  if (requestId) {
    responseData.requestId = requestId;
  }
  
  return new Response(
    JSON.stringify(responseData),
    { 
      status,
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
    timestamp: new Date().toISOString(),
    status
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
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

/**
 * Helper to create a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Middleware to handle CORS preflight requests
 */
export function handleCorsPreflightRequest(): Response | null {
  return new Response(null, { headers: corsHeaders });
}

// Export CORS headers for convenience
export { corsHeaders };
