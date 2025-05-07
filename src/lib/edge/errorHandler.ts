
import { corsHeaders } from '@/lib/env/envUtils';

/**
 * Utility for consistent error handling in edge functions
 */

export interface ErrorResponse {
  success: boolean;
  error: string;
  details?: any;
  timestamp: string;
}

// Export the CORS headers
export { corsHeaders };

/**
 * Format a standardized error response
 * @param message Error message
 * @param status HTTP status code
 * @param details Additional error details
 * @returns Formatted error response
 */
export function formatErrorResponse(
  message: string, 
  status: number = 500,
  details?: any
): Response {
  const body: ErrorResponse = {
    success: false,
    error: message,
    details: details || null,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), { 
    status, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

/**
 * Format a standardized success response
 * @param data Response data
 * @param status HTTP status code
 * @returns Formatted success response
 */
export function formatSuccessResponse(
  data: any, 
  status: number = 200
): Response {
  const body = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), { 
    status, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

/**
 * Safely execute a function with consistent error handling
 * @param fn Function to execute
 * @param errorMsg Error message if the function fails
 * @returns Result of the function or throws a standardized error
 */
export async function safeExecute<T>(
  fn: () => Promise<T>, 
  errorMsg: string
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    console.error(`${errorMsg}:`, error);
    throw new Error(`${errorMsg}: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Handle edge function request with consistent error handling
 * @param req Request object
 * @param handler Request handler function
 * @returns Response object
 */
export async function handleEdgeRequest(
  req: Request,
  handler: (req: Request) => Promise<Response>
): Promise<Response> {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    return await handler(req);
  } catch (error: any) {
    console.error('Edge function error:', error);
    return formatErrorResponse(
      error.message || 'An unexpected error occurred',
      500
    );
  }
}
