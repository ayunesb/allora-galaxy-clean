
/**
 * A centralized utility for managing environment variables across the application
 */

/**
 * Get an environment variable with a default fallback
 * @param key The environment variable key
 * @param defaultValue Optional default value if environment variable is not found
 */
export function getEnvironmentVariable(key: string, defaultValue: string = ''): string {
  try {
    // First try Deno environment (Edge Functions)
    // @ts-ignore - Deno may be available in edge functions
    if (typeof globalThis !== 'undefined' && globalThis.Deno?.env?.get) {
      // @ts-ignore
      const denoValue = globalThis.Deno.env.get(key);
      if (denoValue !== undefined) return denoValue;
    }
    
    // Then try Node.js process.env
    if (typeof process !== 'undefined' && process?.env) {
      const nodeValue = process.env[key];
      if (nodeValue !== undefined) return nodeValue;
    }
    
    // Finally try Vite's import.meta.env
    try {
      // @ts-ignore - import.meta is available in Vite
      if (import.meta?.env && import.meta.env[key] !== undefined) {
        // @ts-ignore
        return import.meta.env[key];
      }
    } catch (e) {
      // Ignore errors accessing import.meta (not available in all contexts)
    }
    
    // Return default if none of the above worked
    return defaultValue;
  } catch (err) {
    console.warn(`Error accessing environment variable ${key}:`, err);
    return defaultValue;
  }
}

/**
 * Environment configuration with type safety
 */
export const ENV = {
  // Core application environment
  NODE_ENV: getEnvironmentVariable('NODE_ENV', 'development'),
  APP_URL: getEnvironmentVariable('VITE_APP_URL', 'http://localhost:3000'),
  
  // Supabase configuration
  SUPABASE_URL: getEnvironmentVariable('VITE_SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnvironmentVariable('VITE_SUPABASE_ANON_KEY', ''),
  SUPABASE_SERVICE_KEY: getEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY', ''),
  
  // Integration APIs
  STRIPE_PUBLISHABLE_KEY: getEnvironmentVariable('VITE_STRIPE_PUBLISHABLE_KEY', ''),
  OPENAI_API_KEY: getEnvironmentVariable('OPENAI_API_KEY', ''),
  HUBSPOT_API_KEY: getEnvironmentVariable('HUBSPOT_API_KEY', ''),
  
  // Analytics
  GA_MEASUREMENT_ID: getEnvironmentVariable('VITE_GA_MEASUREMENT_ID', ''),
};

/**
 * Check if the application is running in a production environment
 */
export function isProduction(): boolean {
  return ENV.NODE_ENV === 'production';
}

/**
 * Get base URL for the current environment
 */
export function getBaseUrl(): string {
  return ENV.APP_URL;
}

/**
 * CORS headers for edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Validate that required environment variables are set
 * @returns Object with validation result and list of missing variables
 */
export function validateEnvironment(requiredVars: string[]): { valid: boolean; missing: string[] } {
  const missing = requiredVars.filter(key => !getEnvironmentVariable(key));
  return {
    valid: missing.length === 0,
    missing
  };
}

// For backward compatibility
export { getEnvironmentVariable as getEnv };
