
/**
 * Interface for environment variable validation
 */
import { getEnvVar, corsHeaders } from '@/lib/env/envUtils';

export { getEnvVar, corsHeaders };

// Define the EnvVariable interface here to avoid importing it
export interface EnvVariable {
  name: string;
  required: boolean;
  description?: string;
  default?: string;
}

/**
 * Validate environment variables
 * @param envVars Array of environment variables to validate
 * @returns Object containing validated environment variables
 */
export function validateEnv(envVars: EnvVariable[]): Record<string, string> {
  const result: Record<string, string> = {};
  const missing: string[] = [];
  
  for (const envVar of envVars) {
    if (envVar.required) {
      const value = getEnvVar(envVar.name, envVar.default);
      if (!value) {
        missing.push(`${envVar.name}: ${envVar.description || 'No description'}`);
      }
    }
    
    const value = getEnvVar(envVar.name, envVar.default || '');
    result[envVar.name] = value;
  }

  // Add validation result to output for reference
  result._valid = String(missing.length === 0);
  result._missing = missing.join(',');

  return result;
}

/**
 * Format standard API error response
 * @param status HTTP status code
 * @param message Error message
 * @param details Additional error details
 * @param executionTime Execution time in seconds
 * @returns Response object with error details
 */
export function formatErrorResponse(
  status: number,
  message: string,
  details?: string,
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
 * Format standard API success response
 * @param data Response data
 * @param executionTime Execution time in seconds
 * @returns Response object with success details
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
      500,
      error.message || 'An unexpected error occurred'
    );
  }
}
