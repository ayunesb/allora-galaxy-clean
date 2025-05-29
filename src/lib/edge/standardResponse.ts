/**
 * Standardized response utilities for edge functions
 */
import { corsHeaders } from "@/lib/env/corsHeaders";

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

export interface ErrorResponseData {
  success: false;
  error: string;
  code?: ErrorCode | string;
  details?: any;
  timestamp: string;
  requestId: string;
  status: number;
}

export interface SuccessResponseData<T = any> {
  success: true;
  data: T;
  timestamp: string;
  requestId: string;
}

/**
 * Generate a unique request ID for tracking
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
  requestId: string = generateRequestId(),
): Response {
  try {
    console.error(`[ERROR ${requestId}] ${message}`, { code, status, details });

    const responseData: ErrorResponseData = {
      success: false,
      error: message,
      code,
      status,
      timestamp: new Date().toISOString(),
      requestId,
    };

    if (details !== undefined) {
      responseData.details = details;
    }

    return new Response(JSON.stringify(responseData), {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    console.error("Error in createErrorResponse:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
        code: ErrorCode.INTERNAL_ERROR,
        status: 500,
        timestamp: new Date().toISOString(),
        requestId,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  }
}

/**
 * Create a standardized success response for edge functions
 */
export function createSuccessResponse<T>(
  data: T,
  requestId: string = generateRequestId(),
): Response {
  try {
    const responseData: SuccessResponseData<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId,
    };

    return new Response(JSON.stringify(responseData), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    console.error("Error in createSuccessResponse:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
        code: ErrorCode.INTERNAL_ERROR,
        status: 500,
        timestamp: new Date().toISOString(),
        requestId,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  }
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
 * Helper for logging edge function errors with request context
 */
export function logEdgeError(
  error: Error,
  requestId: string,
  context?: Record<string, any>,
): void {
  try {
    console.error(`[ERROR ${requestId}]`, {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  } catch (error: unknown) {
    console.error("Error in logEdgeError:", error);
  }
}
