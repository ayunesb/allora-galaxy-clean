
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

export { corsHeaders };

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
