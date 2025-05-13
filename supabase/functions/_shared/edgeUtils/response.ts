
import { corsHeaders } from "./cors.ts";

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  status: number;
  timestamp: string;
  requestId?: string;
}

/**
 * Standard success response format
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
  requestId?: string;
}

/**
 * Create a standardized error response
 * @param message Error message
 * @param details Additional error details
 * @param status HTTP status code
 * @param requestId Request ID for tracking
 * @returns Formatted error response
 */
export function createErrorResponse(
  message: string,
  details?: any,
  status: number = 500,
  requestId?: string
): Response {
  const responseData: ErrorResponse = {
    success: false,
    error: message,
    status,
    timestamp: new Date().toISOString(),
  };
  
  if (details !== undefined) {
    responseData.details = details;
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
 * Create a standardized success response
 * @param data Response data
 * @param status HTTP status code
 * @param requestId Request ID for tracking
 * @returns Formatted success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  requestId?: string
): Response {
  const responseData: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
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
 * Handle unexpected errors in edge functions
 * @param error Error object
 * @param requestId Request ID for tracking
 * @returns Formatted error response
 */
export function handleEdgeError(error: unknown, requestId?: string): Response {
  console.error('Edge function error:', error);
  
  let message = 'An unexpected error occurred';
  let details: any = undefined;
  
  if (error instanceof Error) {
    message = error.message;
    details = { name: error.name, stack: isDevelopment() ? error.stack : undefined };
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    message = (error as any).message || 'Unknown error';
    details = error;
  }
  
  return createErrorResponse(message, details, 500, requestId);
}

/**
 * Helper function to determine if we're in development environment
 */
function isDevelopment(): boolean {
  try {
    return Deno.env.get('ENVIRONMENT')?.toLowerCase() === 'development';
  } catch {
    return false;
  }
}

/**
 * Generate a unique request ID for tracking
 * @returns Unique request ID string
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}
