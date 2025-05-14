
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

/**
 * Helper function to safely get environment variables with fallbacks
 */
function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
  requestId: string;
  status: number;
}

interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
  requestId: string;
}

/**
 * Generate a request ID for tracing
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Create a standardized error response
 */
function createErrorResponse(
  message: string,
  status: number = 500,
  code: string = "INTERNAL_ERROR",
  details?: any,
  requestId: string = generateRequestId()
): Response {
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
 * Create a standardized success response
 */
function createSuccessResponse<T>(
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

// Example request validation schema
interface ExampleRequest {
  tenantId: string;
  someValue: string;
  optionalValue?: number;
}

function validateRequest(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (!data) {
    errors.push("Request body is required");
    return { valid: false, errors };
  }
  
  if (!data.tenantId || typeof data.tenantId !== 'string') {
    errors.push("tenantId is required and must be a string");
  }
  
  if (!data.someValue || typeof data.someValue !== 'string') {
    errors.push("someValue is required and must be a string");
  }
  
  if (data.optionalValue !== undefined && typeof data.optionalValue !== 'number') {
    errors.push("optionalValue must be a number if provided");
  }
  
  return { valid: errors.length === 0, errors };
}

serve(async (req) => {
  // Track start time for performance logging
  const startTime = performance.now();
  const requestId = generateRequestId();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log(`[${requestId}] Request received`);
    
    // Parse request body
    let requestData: ExampleRequest;
    
    try {
      requestData = await req.json();
    } catch (error) {
      return createErrorResponse(
        "Invalid JSON in request body",
        400,
        "BAD_REQUEST",
        { parseError: String(error) },
        requestId
      );
    }
    
    // Validate the request data
    const validation = validateRequest(requestData);
    if (!validation.valid) {
      return createErrorResponse(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        { validationErrors: validation.errors },
        requestId
      );
    }
    
    // Log the valid request
    console.log(`[${requestId}] Processing request for tenant: ${requestData.tenantId}`);
    
    // Get Supabase credentials
    const supabaseUrl = getEnv("SUPABASE_URL");
    const supabaseServiceRole = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceRole) {
      return createErrorResponse(
        "Supabase credentials not configured",
        500,
        "CONFIGURATION_ERROR",
        undefined,
        requestId
      );
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    
    // Check tenant exists (authorization)
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('id', requestData.tenantId)
      .maybeSingle();
    
    if (tenantError) {
      return createErrorResponse(
        "Database error",
        500,
        "DATABASE_ERROR",
        { dbError: tenantError.message },
        requestId
      );
    }
    
    if (!tenant) {
      return createErrorResponse(
        "Tenant not found",
        404,
        "NOT_FOUND",
        { tenantId: requestData.tenantId },
        requestId
      );
    }
    
    // Process the request (simulated example)
    const processedData = {
      requestProcessed: true,
      tenantName: tenant.name,
      inputValue: requestData.someValue,
      processedValue: requestData.someValue.toUpperCase(),
      timestamp: new Date().toISOString()
    };
    
    // Log system event for audit trail
    try {
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: requestData.tenantId,
          module: 'example',
          event: 'request_processed',
          context: {
            request_id: requestId,
            execution_time: (performance.now() - startTime) / 1000
          }
        });
    } catch (logError) {
      console.error(`[${requestId}] Failed to log system event:`, logError);
      // Non-critical error, continue with response
    }
    
    // Return success response
    return createSuccessResponse(processedData, requestId);
    
  } catch (error) {
    console.error(`[${requestId}] Unhandled error:`, error);
    
    // Return standardized error response
    return createErrorResponse(
      "An unexpected error occurred",
      500,
      "INTERNAL_ERROR",
      { errorMessage: String(error) },
      requestId
    );
  }
});
