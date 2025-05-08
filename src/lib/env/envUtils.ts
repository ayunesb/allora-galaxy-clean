
// Utility functions for environment variable management

/**
 * CORS headers for edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Environment variable type
 */
export type EnvVariable = string | undefined;

/**
 * Environment variable interface
 */
export interface ENV {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  [key: string]: string | undefined;
}

/**
 * Get an environment variable with a fallback
 * This function safely handles different environments
 */
export function getEnv(name: string, fallback: string = ''): string {
  try {
    // Check for Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name] || fallback;
    }
    
    // Check for Deno environment (edge functions)
    if (typeof globalThis !== 'undefined' && 'Deno' in globalThis) {
      const deno = (globalThis as any).Deno;
      if (deno && deno.env && typeof deno.env.get === 'function') {
        return deno.env.get(name) || fallback;
      }
    }
    
    // Check for Vite environment variables
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[name] || fallback;
    }
    
    return fallback;
  } catch (error) {
    console.error(`Error accessing environment variable ${name}:`, error);
    return fallback;
  }
}

/**
 * Alias for getEnv to maintain backwards compatibility
 */
export const getEnvVar = getEnv;

/**
 * Validate required environment variables
 */
export function validateEnv(requiredEnvVars: string[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    const value = getEnv(envVar);
    if (!value) {
      missing.push(envVar);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}
