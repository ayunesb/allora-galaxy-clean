
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  corsHeaders, 
  createErrorResponse, 
  createSuccessResponse,
  getEnv,
  handleCorsRequest,
  withRetry,
  validateRequiredFields,
  logSystemEvent
} from "../_shared/edgeUtils.ts";

interface CreateDbFunctionRequest {
  name: string;
  sql: string;
  tenant_id: string;
  description?: string;
}

const REQUIRED_FIELDS = ['name', 'sql', 'tenant_id'];

serve(async (req: Request) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) return corsResponse;
  
  const requestId = `dbfn_${Date.now().toString(36)}`;
  const requestStart = performance.now();
  
  try {
    // Verify required environment variables
    const SUPABASE_URL = getEnv('SUPABASE_URL', true);
    const SUPABASE_SERVICE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY', true);
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return createErrorResponse(
        "Supabase credentials not configured",
        undefined,
        500
      );
    }
    
    // Create authenticated Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Parse and validate request body
    let body: CreateDbFunctionRequest;
    try {
      body = await req.json();
    } catch (error) {
      return createErrorResponse(
        "Invalid JSON in request body",
        String(error),
        400
      );
    }
    
    // Validate required fields
    const missingFields = validateRequiredFields(body, REQUIRED_FIELDS);
    if (missingFields.length > 0) {
      return createErrorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        { required: REQUIRED_FIELDS },
        400
      );
    }
    
    // Normalize function name to prevent SQL injection
    const normalizedName = normalizeIdentifier(body.name);
    if (normalizedName !== body.name) {
      return createErrorResponse(
        "Invalid function name",
        "Function name must only contain alphanumeric characters and underscores",
        400
      );
    }
    
    // Validate SQL to prevent unsafe operations
    const validationResult = validateSql(body.sql);
    if (!validationResult.valid) {
      return createErrorResponse(
        "Invalid SQL",
        validationResult.reason,
        400
      );
    }
    
    console.log(`[${requestId}] Creating DB function: ${normalizedName}`);
    
    // Execute the SQL to create the function with retry logic
    try {
      await withRetry(
        async () => {
          const { error } = await supabase.rpc('execute_admin_sql', { sql: body.sql });
          if (error) throw error;
        },
        {
          retries: 3,
          delay: 500,
          backoff: 2,
          onRetry: (attempt, error) => {
            console.log(`[${requestId}] Retry attempt ${attempt} after error: ${error.message}`);
          }
        }
      );
    } catch (error: any) {
      // Log the error
      await logSystemEvent(
        supabase,
        'system',
        'db_function_creation_failed',
        {
          function_name: normalizedName,
          error: error.message,
          request_id: requestId
        },
        body.tenant_id
      );
      
      return createErrorResponse(
        "Failed to create database function",
        error.message,
        500
      );
    }
    
    // Log successful function creation
    await logSystemEvent(
      supabase,
      'system',
      'db_function_created',
      {
        function_name: normalizedName,
        description: body.description || '',
        request_id: requestId
      },
      body.tenant_id
    );
    
    // Record the function in our custom functions registry
    try {
      await withRetry(
        async () => {
          const { error } = await supabase
            .from('custom_db_functions')
            .insert({
              name: normalizedName,
              description: body.description || '',
              tenant_id: body.tenant_id,
              sql: body.sql
            });
          if (error) throw error;
        },
        { retries: 3, delay: 500 }
      );
    } catch (registryError: any) {
      console.warn(`[${requestId}] Failed to record function in registry: ${registryError.message}`);
      // Non-fatal error, we'll still return success
    }
    
    // Return success response
    const executionTime = (performance.now() - requestStart) / 1000;
    return createSuccessResponse({
      success: true,
      function_name: normalizedName,
      execution_time: executionTime,
      request_id: requestId
    });
    
  } catch (error: any) {
    console.error(`[${requestId}] Unexpected error:`, error);
    
    return createErrorResponse(
      "Failed to process request",
      error.message || String(error),
      500
    );
  }
});

/**
 * Normalize identifier to prevent SQL injection
 * @param identifier The identifier to normalize
 * @returns The normalized identifier
 */
function normalizeIdentifier(identifier: string): string {
  // Only allow alphanumeric characters and underscores
  // Replace anything else with an underscore
  return identifier.replace(/[^a-zA-Z0-9_]/g, '_')
    // Ensure it doesn't start with a number
    .replace(/^(\d)/, '_$1');
}

/**
 * Validate SQL to prevent unsafe operations
 * @param sql The SQL to validate
 * @returns Validation result
 */
function validateSql(sql: string): { valid: boolean; reason?: string } {
  // Check for potentially dangerous operations
  const lowerSql = sql.toLowerCase();
  
  // Prevent dropping objects
  if (lowerSql.includes('drop table') || 
      lowerSql.includes('drop function') || 
      lowerSql.includes('drop schema') ||
      lowerSql.includes('drop database')) {
    return {
      valid: false,
      reason: "DROP operations are not allowed"
    };
  }
  
  // Prevent truncating tables
  if (lowerSql.includes('truncate table')) {
    return {
      valid: false,
      reason: "TRUNCATE operations are not allowed"
    };
  }
  
  // Prevent altering system tables
  if ((lowerSql.includes('alter table') || lowerSql.includes('alter function')) && 
      (lowerSql.includes('pg_') || 
       lowerSql.includes('auth.') || 
       lowerSql.includes('realtime.') ||
       lowerSql.includes('storage.'))) {
    return {
      valid: false,
      reason: "Altering system tables is not allowed"
    };
  }
  
  // Prevent creating tables or schemas (should be done via migrations)
  if (lowerSql.includes('create table') || lowerSql.includes('create schema')) {
    return {
      valid: false,
      reason: "Creating tables or schemas should be done via migrations"
    };
  }
  
  // Ensure this is creating a function
  if (!lowerSql.includes('create or replace function') && 
      !lowerSql.includes('create function')) {
    return {
      valid: false,
      reason: "SQL must create a function"
    };
  }
  
  return { valid: true };
}
