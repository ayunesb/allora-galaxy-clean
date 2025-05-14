
/**
 * Shared utilities for edge functions
 */

// CORS headers for all edge functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Error codes for standardized error handling
export enum ErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMITED = "RATE_LIMITED",
  VALIDATION_ERROR = "VALIDATION_ERROR", 
  CONFLICT = "CONFLICT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

// Standard error response interface
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  requestId: string;
  timestamp: string;
  status: number;
}

// Standard success response interface
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Create a standardized error response for edge functions
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  code: ErrorCode | string = ErrorCode.INTERNAL_ERROR,
  details?: any,
  requestId: string = generateRequestId()
): Response {
  console.error(`[${requestId}] Error: ${message}`, { code, status, details });
  
  const responseData: ErrorResponse = {
    success: false,
    error: message,
    code,
    status,
    timestamp: new Date().toISOString(),
    requestId
  };
  
  if (details !== undefined) {
    responseData.details = details;
  }
  
  return new Response(
    JSON.stringify(responseData),
    { 
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}

/**
 * Create a standardized success response for edge functions
 */
export function createSuccessResponse<T>(
  data: T, 
  requestId: string = generateRequestId()
): Response {
  const responseData: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId
  };
  
  return new Response(
    JSON.stringify(responseData),
    {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsRequest(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Safely parse request body as JSON
 * @returns Parsed JSON body or error response
 */
export async function parseJsonBody<T>(
  req: Request, 
  requestId: string = generateRequestId()
): Promise<{ body: T; error: null } | { body: null; error: Response }> {
  try {
    const body = await req.json() as T;
    return { body, error: null };
  } catch (error) {
    const errorResponse = createErrorResponse(
      "Invalid JSON in request body", 
      400, 
      ErrorCode.BAD_REQUEST, 
      { parseError: String(error) },
      requestId
    );
    return { body: null, error: errorResponse };
  }
}

/**
 * Validate request body against required fields
 */
export function validateRequiredFields<T extends object>(
  body: T, 
  requiredFields: string[], 
  requestId: string = generateRequestId()
): { valid: true } | { valid: false; error: Response } {
  const missingFields = requiredFields.filter(field => !(field in body) || body[field as keyof T] === undefined || body[field as keyof T] === null);
  
  if (missingFields.length > 0) {
    const error = createErrorResponse(
      "Missing required fields", 
      400, 
      ErrorCode.VALIDATION_ERROR,
      { missing_fields: missingFields },
      requestId
    );
    return { valid: false, error };
  }
  
  return { valid: true };
}

/**
 * Log structured information from edge functions
 */
export function logEdgeInfo(
  requestId: string, 
  message: string, 
  data?: Record<string, any>
): void {
  console.log(`[${requestId}] ${message}`, data || {});
}

/**
 * Log structured error information from edge functions
 */
export function logEdgeError(
  requestId: string, 
  error: Error | string, 
  context?: Record<string, any>
): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[${requestId}] Error: ${errorMessage}`, {
    stack: errorStack,
    ...context
  });
}
