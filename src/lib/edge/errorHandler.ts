
import { corsHeaders } from '@/lib/env/environment';

export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR'
}

export interface ErrorResponseData {
  success: false;
  error: string;
  details?: any;
  timestamp: string;
  code?: string;
  requestId: string;
  status: number;
  source?: string;
  path?: string;
}

export interface SuccessResponseData<T = any> {
  success: true;
  data: T;
  timestamp: string;
  requestId: string;
}

export type StandardResponseData<T = any> = SuccessResponseData<T> | ErrorResponseData;

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Normalize error object to extract consistent properties
 */
export function normalizeError(err: unknown): {
  message: string;
  code?: string;
  status?: number;
  details?: any;
} {
  if (err instanceof Error) {
    return {
      message: err.message,
      code: (err as any).code,
      status: (err as any).status || 500,
      details: (err as any).details
    };
  }
  
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, any>;
    return {
      message: errorObj.message || errorObj.error || 'Unknown error',
      code: errorObj.code,
      status: errorObj.status || 500,
      details: errorObj.details
    };
  }
  
  return {
    message: String(err) || 'Unknown error',
    status: 500
  };
}

/**
 * Error handler for edge functions
 * @param err The error object
 * @param requestId Optional request ID for tracking
 * @returns A JSON response with the error message
 */
export function handleEdgeError(err: any, requestId: string = generateRequestId()): Response {
  // Log the error for debugging
  console.error(`Edge Function Error ${requestId}:`, err);
  
  const { message, code, status, details } = normalizeError(err);
  
  // Create standardized error response
  const responseData: ErrorResponseData = { 
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    status: status || 500,
    requestId,
    code: code || ErrorCode.INTERNAL_ERROR,
    source: 'edge'
  };
  
  if (details) {
    responseData.details = details;
  }
  
  // Return formatted error response
  return new Response(
    JSON.stringify(responseData),
    { 
      status: status || 500,
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
export function createSuccessResponse<T>(
  data: T, 
  status: number = 200, 
  requestId: string = generateRequestId()
): Response {
  const responseData: SuccessResponseData<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId
  };
  
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
  requestId: string = generateRequestId()
): Response {
  const responseData: ErrorResponseData = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    status,
    requestId,
    code: code || getErrorCodeForStatus(status)
  };
  
  if (details !== undefined) {
    responseData.details = details;
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
 * Get appropriate error code for HTTP status code
 */
function getErrorCodeForStatus(status: number): string {
  switch (status) {
    case 400: return ErrorCode.BAD_REQUEST;
    case 401: return ErrorCode.UNAUTHORIZED;
    case 403: return ErrorCode.FORBIDDEN;
    case 404: return ErrorCode.NOT_FOUND;
    case 409: return ErrorCode.CONFLICT;
    case 429: return ErrorCode.RATE_LIMITED;
    case 503: return ErrorCode.SERVICE_UNAVAILABLE;
    default: return ErrorCode.INTERNAL_ERROR;
  }
}

/**
 * Helper to create a unique request ID
 */
export function handleRequestWithErrorCapture<T>(
  fn: (requestId: string) => Promise<Response>,
  options: {
    generateId?: boolean;
    requestId?: string;
  } = {}
): Promise<Response> {
  const requestId = options.requestId || (options.generateId !== false ? generateRequestId() : undefined);
  
  return fn(requestId || '').catch((err) => {
    return handleEdgeError(err, requestId);
  });
}

/**
 * Middleware to handle CORS preflight requests
 */
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// Export CORS headers for convenience
export { corsHeaders };
