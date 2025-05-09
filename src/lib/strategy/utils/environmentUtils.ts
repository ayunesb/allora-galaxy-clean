
/**
 * Safe environment variable getter for Deno environment
 * This function safely accesses environment variables in edge functions
 * @param key Environment variable key
 * @param defaultValue Default value if environment variable is not found
 * @returns The environment variable value or the default value
 */
export function getDenoEnv(key: string, defaultValue: string = ""): string {
  try {
    // First try Deno environment
    if (typeof globalThis !== 'undefined' && 
        'Deno' in globalThis && 
        typeof (globalThis as any).Deno?.env?.get === 'function') {
      const value = (globalThis as any).Deno.env.get(key);
      if (value !== undefined) return value;
    }
    
    // Fall back to process.env for Node.js environments
    if (typeof process !== 'undefined' && process?.env) {
      const value = process.env[key];
      if (value !== undefined) return value;
    }
    
    return defaultValue;
  } catch (err) {
    console.warn(`Error accessing env variable ${key}:`, err);
    return defaultValue;
  }
}

/**
 * Get all environment variables needed for strategy execution
 * @returns Object containing all required environment variables
 */
export function getStrategyExecutionEnv(): Record<string, string> {
  return {
    SUPABASE_URL: getDenoEnv('SUPABASE_URL', ''),
    SUPABASE_SERVICE_KEY: getDenoEnv('SUPABASE_SERVICE_ROLE_KEY', ''),
    SUPABASE_ANON_KEY: getDenoEnv('SUPABASE_ANON_KEY', ''),
    OPENAI_API_KEY: getDenoEnv('OPENAI_API_KEY', ''),
    NODE_ENV: getDenoEnv('NODE_ENV', 'development')
  };
}

/**
 * Check if required environment variables are present
 * @param requiredVars Array of required environment variable names
 * @returns Object indicating if all required variables are present and list of missing variables
 */
export function validateRequiredEnv(requiredVars: string[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    const value = getDenoEnv(varName);
    if (!value) {
      missing.push(varName);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}
