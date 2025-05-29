/**
 * Environment variable utilities for edge functions
 */

// Deno safe environment variable getter with fallback to process.env
export function getEnv(key: string, defaultValue: string = ''): string {
  // Try Deno environment first
  if (typeof Deno !== 'undefined') {
    try {
      const value = Deno.env.get(key);
      if (value) return value;
    } catch (error) {
      console.warn(`Error accessing Deno.env: ${error.message}`);
    }
  }
  
  // Fall back to process.env for non-Deno environments
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  
  // Return default value if nothing found
  return defaultValue;
}

// Validate required environment variables
export function validateEnv(requiredEnvVars: string[]): boolean {
  const missing = requiredEnvVars.filter(varName => !getEnv(varName));
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

export const ANON_KEY = getEnv('SUPABASE_ANON_KEY', '');
export const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY', '');
export const PROJECT_URL = getEnv('SUPABASE_PROJECT_URL', '');

// Verification helper
export function isEnvironmentValid(): boolean {
  return validateEnv(['SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_PROJECT_URL']);
}
