
/**
 * Utilities for safely accessing environment variables in edge functions
 */

/**
 * Safely get a Deno environment variable with fallback
 * @param key Environment variable name
 * @param defaultValue Default value if not found
 * @returns The environment variable value or default
 */
export function safeGetDenoEnv(key: string, defaultValue: string = ""): string {
  try {
    // First try Deno environment if available
    if (typeof globalThis !== 'undefined') {
      // Check if Deno exists before trying to access .env
      // @ts-ignore - Accessing potential Deno property
      const deno = globalThis.Deno;
      // @ts-ignore - Deno is not recognized in TypeScript
      if (deno?.env?.get) {
        // @ts-ignore - Access Deno env
        const value = deno.env.get(key);
        if (value !== undefined) return value;
      }
    }
    
    // Fall back to process.env for Node environments
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
    
    return defaultValue;
  } catch (err) {
    console.warn(`Error accessing environment variable ${key}:`, err);
    return defaultValue;
  }
}

/**
 * Get edge function environment variables
 * @returns Environment variables object
 */
export function getEdgeEnv() {
  return {
    SUPABASE_URL: safeGetDenoEnv('SUPABASE_URL'),
    SUPABASE_ANON_KEY: safeGetDenoEnv('SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_KEY: safeGetDenoEnv('SUPABASE_SERVICE_ROLE_KEY'),
  };
}

/**
 * Get the current edge function environment (dev, staging, prod)
 */
export function getEdgeEnvironment(): 'development' | 'staging' | 'production' {
  const envMode = safeGetDenoEnv('MODE', safeGetDenoEnv('NODE_ENV', 'development'));
  
  if (envMode === 'production') return 'production';
  if (envMode === 'staging') return 'staging';
  return 'development';
}
