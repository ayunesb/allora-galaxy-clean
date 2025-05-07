
/**
 * Environment variable manager for edge functions with fallback support
 * Works in both Supabase Edge Functions (Deno) and Node.js environments
 */

// Type for environment variable configuration
export interface EnvVarConfig {
  name: string;
  required: boolean;
  fallback?: string;
  description: string;
}

/**
 * Get environment variable with fallback support
 * @param name Environment variable name
 * @param required Whether the variable is required
 * @param fallback Fallback value if not found
 * @returns The environment variable value or fallback
 */
export function getEnv(
  name: string, 
  required = false, 
  fallback = '',
  description = ''
): string {
  let value: string | undefined;
  
  // Try runtime-specific environment access
  // This approach avoids direct references to Deno which causes build errors
  try {
    // @ts-ignore - Runtime environments handled differently
    const runtimeEnv = 
      // For Deno runtime (Supabase Edge Functions)
      (typeof globalThis !== 'undefined' && 
       // @ts-ignore - Deno runtime check without direct reference
       globalThis.Deno?.env?.get) ? 
        // @ts-ignore - Deno runtime environment
        globalThis.Deno.env.get(name) :
      // For Node.js/browser runtime
      (typeof process !== 'undefined' && process.env) ?
        process.env[name] :
      undefined;
      
    if (runtimeEnv) value = runtimeEnv;
  } catch (error) {
    // Suppress errors in environments where these objects might not exist
    console.debug(`Environment access error for ${name}:`, error);
  }
  
  // Fallback to import.meta.env for Vite
  if (!value && typeof import.meta !== 'undefined' && import.meta.env) {
    value = import.meta.env[`VITE_${name}`] || import.meta.env[name];
  }
  
  // If value is still not found
  if (!value) {
    if (required && !fallback) {
      console.error(`Required environment variable ${name} not found: ${description}`);
      throw new Error(`Required environment variable ${name} not found`);
    }
    return fallback;
  }
  
  return value;
}

/**
 * Validate multiple environment variables at once
 * @param configs Array of environment variable configurations
 * @returns Object with all environment variables
 */
export function validateEnv(configs: EnvVarConfig[]): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const config of configs) {
    try {
      result[config.name] = getEnv(
        config.name,
        config.required,
        config.fallback || '',
        config.description
      );
    } catch (error: any) {
      // Rethrow with more context if validation fails
      throw new Error(`Environment validation failed: ${error.message}`);
    }
  }
  
  return result;
}

/**
 * Log environment variable status (with redacted values)
 * @param env Environment variables object
 */
export function logEnvStatus(env: Record<string, string>): void {
  for (const [key, value] of Object.entries(env)) {
    const redactedValue = value ? '✓ [set]' : '✗ [missing]';
    console.log(`ENV ${key}: ${redactedValue}`);
  }
}

/**
 * Generate CORS headers for edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
