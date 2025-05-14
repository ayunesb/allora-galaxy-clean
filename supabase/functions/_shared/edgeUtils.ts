
/**
 * Common utilities for edge functions
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Get an environment variable
 * @param name The name of the environment variable
 * @param fallback Optional fallback value
 * @returns The environment variable value or fallback
 */
export function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

/**
 * Parse JSON from request body with error handling
 * @param req The request object
 * @returns Parsed JSON data
 * @throws Error if parsing fails
 */
export async function parseJsonBody<T>(req: Request): Promise<T> {
  try {
    return await req.json() as T;
  } catch (error) {
    throw new Error(`Invalid JSON in request body: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create a standardized error response
 * @param message Error message
 * @param details Optional error details
 * @param status HTTP status code
 * @returns Response object
 */
export function createErrorResponse(
  message: string,
  details?: any,
  status: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
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
 * @param message Optional success message
 * @returns Response object
 */
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Operation successful'
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

/**
 * Handle CORS preflight request
 * @param req The request object
 * @returns Response or null
 */
export function handleCorsRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  return null;
}

/**
 * Generate a unique request ID for tracking
 * @returns Unique request ID string
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Log system event to the database
 * @param supabase Supabase client
 * @param module System module name
 * @param event Event name
 * @param context Event context data
 * @param tenantId Tenant ID
 * @returns Result of the operation
 */
export async function logSystemEvent(
  supabase: any,
  module: string,
  event: string,
  context: Record<string, any> = {},
  tenantId: string = 'system'
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('system_logs')
      .insert({
        module,
        event,
        context,
        tenant_id: tenantId,
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(`Error logging system event (${module}/${event}):`, error);
    return { 
      success: false, 
      error
    };
  }
}

/**
 * Validate required fields in request body
 * @param body Request body object
 * @param fields Array of required field names
 * @returns Array of missing field names (empty if all present)
 */
export function validateRequiredFields(
  body: Record<string, any>,
  fields: string[]
): string[] {
  const missing: string[] = [];
  
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missing.push(field);
    }
  }
  
  return missing;
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry options
 * @returns Result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 500,
    backoff = 2,
    onRetry = () => {}
  } = options;
  
  let lastError: any;
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt <= retries) {
        const delayMs = delay * Math.pow(backoff, attempt - 1);
        onRetry(attempt, error);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError;
}
