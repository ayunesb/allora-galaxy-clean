
/**
 * Safely access Deno environment variables in edge functions
 * This prevents errors when running in non-Deno environments
 * @param key The environment variable name
 * @param defaultValue Optional default value
 * @returns The environment variable value or default
 */
export function safeGetDenoEnv(key: string, defaultValue: string = ''): string {
  try {
    // Try to access Deno.env if available
    if (typeof globalThis !== 'undefined' && 
        'Deno' in globalThis && 
        typeof (globalThis as any).Deno?.env?.get === 'function') {
      const value = (globalThis as any).Deno.env.get(key);
      if (value !== undefined) return value;
    }
    return defaultValue;
  } catch (e) {
    console.warn(`Error accessing Deno env for ${key}:`, e);
    return defaultValue;
  }
}

/**
 * Safely get environment variables in edge functions with fallback to process.env
 * @param key The environment variable name
 * @param defaultValue Optional default value
 * @returns The environment variable value or default
 */
export function getEdgeEnv(key: string, defaultValue: string = ''): string {
  // First try Deno.env
  const denoValue = safeGetDenoEnv(key);
  if (denoValue) return denoValue;
  
  // Then try process.env as fallback
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] || defaultValue;
    }
  } catch (e) {
    // Ignore process.env access errors
  }
  
  return defaultValue;
}

/**
 * Get all common environment variables needed for edge functions
 * @returns Object with all environment variables
 */
export function getEdgeEnvironment(): Record<string, string> {
  return {
    SUPABASE_URL: getEdgeEnv('SUPABASE_URL'),
    SUPABASE_SERVICE_ROLE_KEY: getEdgeEnv('SUPABASE_SERVICE_ROLE_KEY'),
    SUPABASE_ANON_KEY: getEdgeEnv('SUPABASE_ANON_KEY'),
    OPENAI_API_KEY: getEdgeEnv('OPENAI_API_KEY'),
    STRIPE_SECRET_KEY: getEdgeEnv('STRIPE_SECRET_KEY'),
    HUBSPOT_API_KEY: getEdgeEnv('HUBSPOT_API_KEY'),
    SENDGRID_API_KEY: getEdgeEnv('SENDGRID_API_KEY'),
    NODE_ENV: getEdgeEnv('NODE_ENV', 'development'),
  };
}
