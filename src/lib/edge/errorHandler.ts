
import { corsHeaders } from './index';

export { corsHeaders };

export interface ErrorResponseData {
  success: false;
  error: string;
  details?: any;
  status?: number;
  execution_time?: number;
  request_id?: string;
}

export interface SuccessResponseData<T = any> {
  success: true;
  data: T;
  execution_time?: number;
  request_id?: string;
}

/**
 * Generate a unique request ID for tracking
 * @returns string - A unique ID
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Handle CORS preflight requests
 * @param req - The incoming request
 * @returns Response object if it's a preflight request, null otherwise
 */
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Create a standardized error response
 * @param message - Error message
 * @param status - HTTP status code
 * @param details - Optional error details
 * @param requestId - Optional request ID for tracking
 * @param startTime - Optional start time for calculating execution time
 * @returns Response object
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: any,
  requestId?: string,
  startTime?: number
): Response {
  const executionTime = startTime ? (performance.now() - startTime) / 1000 : undefined;
  
  const errorBody: ErrorResponseData = {
    success: false,
    error: message,
    details,
    status,
    execution_time: executionTime,
    request_id: requestId || generateRequestId()
  };
  
  return new Response(JSON.stringify(errorBody), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

/**
 * Create a standardized success response
 * @param data - Response data
 * @param requestId - Optional request ID for tracking
 * @param startTime - Optional start time for calculating execution time
 * @returns Response object
 */
export function createSuccessResponse<T = any>(
  data: T,
  requestId?: string,
  startTime?: number
): Response {
  const executionTime = startTime ? (performance.now() - startTime) / 1000 : undefined;
  
  const successBody: SuccessResponseData<T> = {
    success: true,
    data,
    execution_time: executionTime,
    request_id: requestId || generateRequestId()
  };
  
  return new Response(JSON.stringify(successBody), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

/**
 * Handle edge function errors in a consistent way
 * @param error - The error to handle
 * @param requestId - Optional request ID for tracking
 * @param startTime - Optional start time for calculating execution time
 * @returns Response object
 */
export function handleEdgeError(error: any, requestId?: string, startTime?: number): Response {
  console.error('Edge function error:', error);
  
  // Determine appropriate status code
  let status = 500;
  if (error.statusCode) {
    status = error.statusCode;
  } else if (error.status) {
    status = error.status;
  }
  
  // Extract error message
  const message = error.message || error.toString() || 'Unknown error';
  
  // Extract error details
  const details = error.details || error.data || undefined;
  
  return createErrorResponse(message, status, details, requestId, startTime);
}
