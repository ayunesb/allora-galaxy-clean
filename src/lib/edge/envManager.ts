
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
  
  // Try Deno environment first (Edge Functions)
  try {
    if (typeof Deno !== 'undefined' && Deno.env && Deno.env.get) {
      value = Deno.env.get(name);
    }
  } catch (error) {
    // Suppress errors in non-Deno environments
  }
  
  // Fallback to Node.js environment
  if (!value && typeof process !== 'undefined' && process.env) {
    value = process.env[name];
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
    } catch (error) {
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
