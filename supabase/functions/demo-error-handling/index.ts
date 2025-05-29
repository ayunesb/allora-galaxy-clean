import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSuccessResponse, createErrorResponse, handleCorsRequest, generateRequestId } from "../_shared/edgeUtils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Error codes for standardized error handling
enum ErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMITED = "RATE_LIMITED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) return corsResponse;
  
  const requestId = generateRequestId();
  console.log(`[${requestId}] Processing request`);
  
  try {
    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return createErrorResponse(
        "Invalid JSON payload", 
        400, 
        ErrorCode.BAD_REQUEST, 
        { parseError: String(error) },
        requestId
      );
    }
    
    // Extract parameters
    const { errorType, simulateDelay = 0 } = body;
    
    // Simulate processing delay
    if (simulateDelay > 0) {
      console.log(`[${requestId}] Simulating delay of ${simulateDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, Math.min(simulateDelay, 5000)));
    }
    
    // Process the request based on the errorType
    switch (errorType) {
      case "none":
        console.log(`[${requestId}] Returning success response`);
        return createSuccessResponse({ 
          message: "Operation completed successfully",
          timestamp: new Date().toISOString(),
          details: { processed: true }
        }, requestId);
        
      case "badRequest":
        console.log(`[${requestId}] Simulating 400 Bad Request error`);
        return createErrorResponse(
          "Invalid input parameters", 
          400, 
          ErrorCode.BAD_REQUEST,
          { validation: ["Parameter 'x' is required"] },
          requestId
        );
        
      case "unauthorized":
        console.log(`[${requestId}] Simulating 401 Unauthorized error`);
        return createErrorResponse(
          "Authentication required", 
          401, 
          ErrorCode.UNAUTHORIZED,
          undefined,
          requestId
        );
        
      case "forbidden":
        console.log(`[${requestId}] Simulating 403 Forbidden error`);
        return createErrorResponse(
          "You don't have permission to access this resource", 
          403, 
          ErrorCode.FORBIDDEN,
          { required_role: "admin" },
          requestId
        );
        
      case "notFound":
        console.log(`[${requestId}] Simulating 404 Not Found error`);
        return createErrorResponse(
          "The requested resource was not found", 
          404, 
          ErrorCode.NOT_FOUND,
          { resource_id: body.id || "unknown" },
          requestId
        );
        
      case "rateLimited":
        console.log(`[${requestId}] Simulating 429 Rate Limited error`);
        return createErrorResponse(
          "Too many requests, please try again later", 
          429, 
          ErrorCode.RATE_LIMITED,
          { retry_after: 60 },
          requestId
        );
        
      case "serverError":
        console.log(`[${requestId}] Simulating 500 Server Error`);
        return createErrorResponse(
          "An internal server error occurred", 
          500, 
          ErrorCode.INTERNAL_ERROR,
          { error_id: `err_${Date.now()}` },
          requestId
        );
        
      default:
        console.log(`[${requestId}] Unknown error type: ${errorType}, defaulting to 400 Bad Request`);
        return createErrorResponse(
          "Unknown error type specified", 
          400, 
          ErrorCode.BAD_REQUEST,
          { provided: errorType, allowed: ["none", "badRequest", "unauthorized", "forbidden", "notFound", "rateLimited", "serverError"] },
          requestId
        );
    }
  } catch (error) {
    console.error(`[${requestId}] Unhandled error:`, error);
    return createErrorResponse(
      "An unexpected error occurred", 
      500, 
      ErrorCode.INTERNAL_ERROR, 
      { message: error instanceof Error ? error.message : String(error) },
      requestId
    );
  }
});
