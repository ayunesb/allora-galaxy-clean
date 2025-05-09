
/**
 * Shared utilities for all edge functions
 */

/**
 * Standard CORS headers for all edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Safe environment variable getter
 * @param name The environment variable name
 * @param defaultValue Optional default value if not found
 * @returns The environment variable value or default
 */
export function getEnv(name: string, defaultValue: string = ''): string {
  try {
    return Deno.env.get(name) ?? defaultValue;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return defaultValue;
  }
}

/**
 * Handle CORS preflight requests
 * @param req The incoming request
 * @returns Response for OPTIONS requests or null for other methods
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  return null;
}

/**
 * Parse JSON request body with error handling
 * @param req The incoming request
 * @returns Parsed request body
 */
export async function parseJsonBody<T = any>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch (error) {
    throw new Error(`Invalid JSON in request body: ${error.message}`);
  }
}

/**
 * Create a standardized error response
 * @param message Error message
 * @param status HTTP status code
 * @param details Additional error details
 * @returns Response object with error details
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: any
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      details,
      timestamp: new Date().toISOString()
    }),
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
 * @returns Response object with success data
 */
export function createSuccessResponse<T = any>(
  data: T,
  status: number = 200
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString()
    }),
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
 * Log system events to the database and console
 * @param supabase Supabase client instance
 * @param module Module name
 * @param event Event name
 * @param context Event context information
 * @param tenantId Optional tenant ID
 */
export async function logSystemEvent(
  supabase: any,
  module: string,
  event: string,
  context: Record<string, any> = {},
  tenantId?: string
): Promise<void> {
  try {
    // Create log entry
    const logEntry = {
      module,
      event,
      context,
      tenant_id: tenantId,
      created_at: new Date().toISOString()
    };
    
    // Log to console
    console.log(
      `[${module}] ${event}${tenantId ? ` (${tenantId})` : ''}: ${JSON.stringify(context)}`
    );
    
    // Insert into database if supabase client is provided
    if (supabase) {
      await supabase.from('system_logs').insert([logEntry]);
    }
  } catch (err) {
    console.error('Error logging system event:', err);
  }
}

/**
 * Generate a request ID for tracking
 * @returns Unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}
