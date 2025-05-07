
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
 * @param status HTTP status code
 * @param message Error message
 * @param details Additional error details
 * @returns Response object with error details
 */
export function formatErrorResponse(
  status: number,
  message: string,
  details?: any
): Response {
  const body = {
    error: message,
    details: details || null,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
