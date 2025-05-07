
/**
 * Unified environment variable management system for Allora OS
 * Works across Node, browser, and Deno environments
 */

// Type definitions for environment variables
export interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
  default?: string;
}

/**
 * Safely retrieve an environment variable across all runtime environments
 * @param key Environment variable name
 * @param defaultValue Fallback value if not found
 * @returns The environment variable value or default
 */
export function getEnvVar(key: string, defaultValue: string = ""): string {
  try {
    // Try Deno environment first (edge functions)
    if (typeof globalThis !== 'undefined' && 
        'Deno' in globalThis && 
        typeof (globalThis as any).Deno?.env?.get === 'function') {
      return (globalThis as any).Deno.env.get(key) || defaultValue;
    }
    
    // Try Node environment next
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    
    // Try browser environment (Vite imports)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const value = (import.meta.env as Record<string, string>)[key];
      return value || defaultValue;
    }
    
    // Return default if all else fails
    return defaultValue;
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Validate required environment variables
 * @param variables List of environment variables to validate
 * @returns Object containing all environment variables with values
 */
export function validateEnv(variables: EnvVariable[]): Record<string, string> {
  const values: Record<string, string> = {};
  const missing: string[] = [];
  
  for (const variable of variables) {
    const value = getEnvVar(variable.name, variable.default || "");
    values[variable.name] = value;
    
    if (variable.required && !value) {
      missing.push(`${variable.name} (${variable.description})`);
    }
  }
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return values;
}

/**
 * Standard CORS headers for edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Format a standardized error response for edge functions
 */
export function formatErrorResponse(
  status: number,
  message: string,
  details?: any,
  executionTime?: number
): Response {
  const body = {
    success: false,
    error: message,
    details: details || null,
    executionTime,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Format a standardized success response for edge functions
 */
export function formatSuccessResponse(
  data: any,
  executionTime?: number
): Response {
  const body = {
    success: true,
    ...data,
    executionTime,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Handle edge function request with standardized error catching
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
      500,
      error.message || 'An unexpected error occurred'
    );
  }
}
