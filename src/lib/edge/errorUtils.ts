/**
 * Standardized error handling utilities for edge functions
 */

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  requestId?: string;
  timestamp: string;
  status: number;
}

/**
 * Standard success response format
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  requestId?: string;
  timestamp: string;
}

/**
 * Common error codes
 */
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

/**
 * CORS headers for edge functions
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Generate a request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  options: {
    status?: number;
    code?: string | ErrorCode;
    details?: any;
    requestId?: string;
  } = {},
): Response {
  const {
    status = 500,
    code = ErrorCode.INTERNAL_ERROR,
    details,
    requestId = generateRequestId(),
  } = options;

  const responseBody: ErrorResponse = {
    success: false,
    error: message,
    code,
    status,
    timestamp: new Date().toISOString(),
    requestId,
  };

  if (details !== undefined) {
    responseBody.details = details;
  }

  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  options: {
    status?: number;
    requestId?: string;
  } = {},
): Response {
  const { status = 200, requestId = generateRequestId() } = options;

  const responseBody: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId,
  };

  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
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
 * Validate request body against a schema
 */
export async function validateRequestBody<T>(
  req: Request,
  validate: (data: any) => { valid: boolean; errors?: string[] },
): Promise<{ data: T; requestId: string } | Response> {
  const requestId = generateRequestId();

  try {
    const data = await req.json();
    const validation = validate(data);

    if (!validation.valid) {
      return createErrorResponse("Validation failed", {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        details: validation.errors || "Invalid request data",
        requestId,
      });
    }

    return { data: data as T, requestId };
  } catch (error: unknown) {
    return createErrorResponse("Invalid JSON in request body", {
      status: 400,
      code: ErrorCode.BAD_REQUEST,
      details: error instanceof Error ? error.message : String(error),
      requestId,
    });
  }
}

/**
 * Log error details to console with request ID
 */
export function logError(
  error: Error,
  context: Record<string, any> = {},
  requestId?: string,
): void {
  console.error(`[${requestId || "ERROR"}]`, {
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

/**
 * Create a standard handler for edge function errors
 */
export function createEdgeErrorHandler(requestId?: string) {
  return (error: Error | any): Response => {
    const id = requestId || generateRequestId();
    logError(error, {}, id);

    // Determine if this is a known error type with status
    const status = error.status || 500;
    const code = error.code || ErrorCode.INTERNAL_ERROR;

    return createErrorResponse(
      error.message || "An unexpected error occurred",
      {
        status,
        code,
        details:
          process.env.NODE_ENV === "production"
            ? undefined
            : error.stack || undefined,
        requestId: id,
      },
    );
  };
}

/**
 * Create a wrapper for edge function that handles common error cases
 */
export function withErrorHandler<
  T extends (...args: any[]) => Promise<Response>,
>(handler: T): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      const errorHandler = createEdgeErrorHandler();
      return errorHandler(error);
    }
  }) as T;
}

/**
 * Some edge utility function
 */
export function someEdgeUtil() {
  // Implementation...
  try {
    // Some code that may throw
  } catch (error: unknown) {
    // Handle error
  }
}

/**
 * Another edge utility function
 */
export function anotherEdgeUtil() {
  // Implementation...
  try {
    // Some code that may throw
  } catch (error: unknown) {
    // Handle error
  }
}

/**
 * Yet another edge utility function
 */
export function yetAnotherEdgeUtil() {
  // Implementation...
  try {
    // Some code that may throw
  } catch (error: unknown) {
    // Handle error
  }
}

/**
 * And another one
 */
export function andAnotherOne() {
  // Implementation...
  try {
    // Some code that may throw
  } catch (error: unknown) {
    // Handle error
  }
}

/**
 * Final edge utility function
 */
export function finalEdgeUtil() {
  // Implementation...
  try {
    // Some code that may throw
  } catch (error: unknown) {
    // Handle error
  }
}
