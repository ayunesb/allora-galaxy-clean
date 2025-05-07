
/**
 * Environment variable utilities for accessing configuration in a safe and consistent way
 */

/**
 * Environment variable names enum
 * Add all environment variables that your application uses here
 */
export enum EnvVariable {
  VITE_SUPABASE_URL = 'VITE_SUPABASE_URL',
  VITE_SUPABASE_ANON_KEY = 'VITE_SUPABASE_ANON_KEY',
  VITE_OPENAI_API_KEY = 'VITE_OPENAI_API_KEY',
  VITE_HUBSPOT_API_KEY = 'VITE_HUBSPOT_API_KEY',
  VITE_STRIPE_SECRET_KEY = 'VITE_STRIPE_SECRET_KEY',
  VITE_STRIPE_PUBLISHABLE_KEY = 'VITE_STRIPE_PUBLISHABLE_KEY'
}

/**
 * Get an environment variable in a safe way
 * 
 * @param name The name of the environment variable to get
 * @param required Whether the environment variable is required (throws if not found)
 * @param defaultValue A default value to return if the environment variable is not found and not required
 * @returns The value of the environment variable
 */
export function getEnvVar(
  name: EnvVariable | string,
  required: boolean = false,
  defaultValue: string = ''
): string {
  let value: string | undefined;
  
  // Try to get from Deno.env if in Deno environment (edge functions)
  if (typeof Deno !== 'undefined' && Deno?.env) {
    try {
      value = Deno.env.get(name);
    } catch (e) {
      // Deno.env might be restricted in some contexts
      console.debug(`Could not access Deno.env for ${name}`);
    }
  }
  
  // Fallback to process.env if in Node environment
  if (!value && typeof process !== 'undefined' && process?.env) {
    value = process.env[name];
  }
  
  // Fallback to import.meta.env for Vite
  if (!value && typeof import.meta !== 'undefined' && import.meta?.env) {
    value = (import.meta.env as any)[name];
  }
  
  // Handle missing required variables
  if (!value && required) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  
  // Return the value or default
  return value || defaultValue;
}

/**
 * Validate that all required environment variables are set
 * 
 * @param requiredVars List of required environment variables
 * @returns Object with valid flag and any missing variables
 */
export function validateEnv(requiredVars: EnvVariable[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    try {
      const value = getEnvVar(varName);
      if (!value) {
        missing.push(varName);
      }
    } catch (e) {
      missing.push(varName);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * CORS headers for edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
