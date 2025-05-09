
/**
 * Safely get environment variables in Deno edge functions
 * @param key The environment variable name
 * @param defaultValue Optional default value
 * @returns The environment variable value or default
 */
export function getDenoEnv(key: string, defaultValue: string = ''): string {
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
    console.warn(`Error accessing Deno env variable ${key}:`, e);
    return defaultValue;
  }
}

/**
 * Get secure environment variables required for strategy execution
 * @returns Object containing secure environment variables
 */
export function getStrategyExecutionEnv(): Record<string, string> {
  return {
    OPENAI_API_KEY: getDenoEnv('OPENAI_API_KEY', ''),
    SUPABASE_URL: getDenoEnv('SUPABASE_URL', ''),
    SUPABASE_SERVICE_ROLE_KEY: getDenoEnv('SUPABASE_SERVICE_ROLE_KEY', ''),
    HUBSPOT_API_KEY: getDenoEnv('HUBSPOT_API_KEY', '')
  };
}

/**
 * Validate required environment variables for strategy execution
 * @returns Object with validation result and missing variables
 */
export function validateStrategyExecutionEnv(): { valid: boolean; missing: string[] } {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingVars = requiredVars.filter(key => !getDenoEnv(key));
  
  return {
    valid: missingVars.length === 0,
    missing: missingVars
  };
}
