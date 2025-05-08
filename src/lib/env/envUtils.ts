
/**
 * Environment variable utilities for accessing configuration in a safe and consistent way
 */

/**
 * Environment variable interface
 */
export interface EnvVariable {
  name: string;
  required?: boolean;
  description?: string;
  default?: string;
}

/**
 * Common environment variable names
 * Add all environment variables that your application uses here
 */
export const ENV = {
  SUPABASE_URL: 'VITE_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'VITE_SUPABASE_ANON_KEY',
  OPENAI_API_KEY: 'VITE_OPENAI_API_KEY',
  HUBSPOT_API_KEY: 'VITE_HUBSPOT_API_KEY',
  STRIPE_SECRET_KEY: 'VITE_STRIPE_SECRET_KEY',
  STRIPE_PUBLISHABLE_KEY: 'VITE_STRIPE_PUBLISHABLE_KEY'
};

/**
 * Get an environment variable in a safe way
 * 
 * @param name The name of the environment variable to get
 * @param defaultValue A default value to return if the environment variable is not found
 * @returns The value of the environment variable
 */
export function getEnvVar(
  name: string,
  defaultValue: string = ''
): string {
  let value: string | undefined;
  
  // Try to get from Deno.env if in Deno environment (edge functions)
  try {
    if (typeof globalThis !== 'undefined' && 
        'Deno' in globalThis && 
        typeof globalThis.Deno?.env?.get === 'function') {
      value = globalThis.Deno.env.get(name);
    }
  } catch (e) {
    // Deno.env might be restricted in some contexts
    console.debug(`Could not access Deno.env for ${name}`);
  }
  
  // Fallback to process.env if in Node environment
  if (!value && typeof process !== 'undefined' && process?.env) {
    value = process.env[name];
  }
  
  // Fallback to import.meta.env for Vite
  if (!value && typeof import.meta !== 'undefined' && import.meta?.env) {
    value = (import.meta.env as any)[name];
  }

  // Provide hardcoded defaults for critical values in development 
  // (this is a safety net to prevent blank screens)
  if (!value && name === ENV.SUPABASE_URL) {
    console.warn('VITE_SUPABASE_URL not found, using fallback for development');
    return 'https://ijrnwpgsqsxzqdemtknz.supabase.co';
  }
  
  if (!value && name === ENV.SUPABASE_ANON_KEY) {
    console.warn('VITE_SUPABASE_ANON_KEY not found, using fallback for development');
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo';
  }
  
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
  
  for (const envVar of requiredVars) {
    try {
      const value = getEnvVar(envVar.name);
      if (!value && envVar.required) {
        missing.push(envVar.name);
      }
    } catch (e) {
      if (envVar.required) {
        missing.push(envVar.name);
      }
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
