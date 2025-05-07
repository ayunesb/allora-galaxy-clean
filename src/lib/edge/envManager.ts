
/**
 * Interface for environment variable validation
 */
export interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  default?: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Safely get environment variables with fallback support
 * @param name Environment variable name
 * @param fallback Optional fallback value
 * @returns Environment variable value or fallback
 */
export function getEnvVar(name: string, fallback: string = ""): string {
  try {
    // Check if we're in Deno environment
    if (typeof globalThis !== 'undefined' && 'Deno' in globalThis && typeof (globalThis as any).Deno?.env?.get === 'function') {
      return (globalThis as any).Deno.env.get(name) || fallback;
    }
    // Fallback to process.env for Node environment
    return process.env[name] || fallback;
  } catch (error) {
    // If all else fails, return the fallback
    console.warn(`Error accessing env var ${name}:`, error);
    return fallback;
  }
}

/**
 * Validate environment variables
 * @param envVars Array of environment variables to validate
 * @returns Object containing validated environment variables
 */
export function validateEnv(envVars: EnvVar[]): Record<string, string> {
  const result: Record<string, string> = {};
  const missing: string[] = [];

  for (const envVar of envVars) {
    const value = getEnvVar(envVar.name, envVar.default || '');
    result[envVar.name] = value;

    if (envVar.required && !value) {
      missing.push(`${envVar.name} (${envVar.description})`);
    }
  }

  if (missing.length > 0) {
    console.warn(`⚠️ Missing required environment variables: ${missing.join(', ')}`);
  }

  return result;
}

/**
 * Log environment status without exposing values
 * @param env Object containing environment variables
 */
export function logEnvStatus(env: Record<string, string>): void {
  console.log('Environment status:');
  
  for (const [key, value] of Object.entries(env)) {
    const status = value ? '✅' : '❌';
    console.log(`- ${key}: ${status}`);
  }
}

/**
 * Format standard API error response
 * @param message Error message
 * @param status HTTP status code
 * @param details Additional error details
 * @returns Response object with error details
 */
export function formatErrorResponse(
  message: string,
  status: number = 500,
  details?: any
): Response {
  const body = {
    success: false,
    error: message,
    details: details || null,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Format standard API success response
 * @param data Response data
 * @param status HTTP status code
 * @returns Response object with success details
 */
export function formatSuccessResponse(
  data: any,
  status: number = 200
): Response {
  const body = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Handle edge function request with consistent error handling
 * @param req Request object
 * @param handler Request handler function
 * @returns Response object
 */
export async function handleEdgeRequest(
  req: Request,
  handler: (req: Request) => Promise<Response>
): Promise<Response> {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    return await handler(req);
  } catch (error: any) {
    console.error('Edge function error:', error);
    return formatErrorResponse(
      error.message || 'An unexpected error occurred',
      500
    );
  }
}
