
/**
 * Shared utilities for Edge Functions
 */

// CORS headers for all edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Safely get environment variables with fallback value
 * @param name Name of the environment variable
 * @param fallback Default value if not found
 * @returns The environment variable value or fallback
 */
export function getEnv(name: string, fallback: string = ''): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

/**
 * Get an environment variable or throw if not found
 * @param name Name of the required environment variable
 * @returns The environment variable value
 * @throws Error if the environment variable is not set
 */
export function getRequiredEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  status: number;
  timestamp: string;
  requestId?: string;
}

/**
 * Standard success response format
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
  requestId?: string;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  details?: any,
  status: number = 500,
  requestId?: string
): Response {
  const response: ErrorResponse = {
    success: false,
    error: message,
    status,
    timestamp: new Date().toISOString(),
  };
  
  if (details !== undefined) {
    response.details = details;
  }
  
  if (requestId) {
    response.requestId = requestId;
  }
  
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  requestId?: string
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  
  if (requestId) {
    response.requestId = requestId;
  }
  
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

/**
 * Log a system event to the database
 */
export async function logSystemEvent(
  supabase: any,
  module: string,
  event: string,
  context: Record<string, any> = {},
  tenantId?: string
): Promise<boolean> {
  try {
    // Create the log entry
    const logEntry = {
      module,
      event,
      context,
      tenant_id: tenantId
    };
    
    // Insert into system_logs table
    const { error } = await supabase
      .from('system_logs')
      .insert(logEntry);
    
    if (error) {
      console.error('Error logging system event:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    // Don't let logging failures break the application
    console.error('Error in logSystemEvent:', err);
    return false;
  }
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Parse JSON request body with error handling
 */
export async function parseJsonBody<T = any>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch (error) {
    throw new Error(`Invalid JSON in request body: ${error.message}`);
  }
}
