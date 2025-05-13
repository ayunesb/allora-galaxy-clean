
/**
 * Universal environment variable getter that works in both Deno and Node environments
 * @param key The environment variable key to retrieve
 * @param defaultValue Optional default value if the environment variable is not found
 * @returns The environment variable value or the default value
 */
export function getEnv(key: string, defaultValue: string = ""): string {
  try {
    // First try Deno environment
    // @ts-ignore - Deno may be available in edge functions
    if (typeof globalThis !== 'undefined' && globalThis.Deno?.env?.get) {
      // @ts-ignore
      const value = globalThis.Deno.env.get(key);
      if (value !== undefined) return value;
    }
    
    // Fall back to process.env for Node environments
    if (typeof process !== 'undefined' && process?.env) {
      const value = process.env[key];
      if (value !== undefined) return value;
    }
    
    // Use import.meta.env for browser/Vite environments
    try {
      // @ts-ignore - import.meta is available in Vite
      if (import.meta?.env && import.meta.env[key] !== undefined) {
        // @ts-ignore
        return import.meta.env[key];
      }
    } catch (e) {
      // Ignore errors accessing import.meta (not available in all contexts)
    }
    
    return defaultValue;
  } catch (err) {
    console.warn(`Error accessing env variable ${key}:`, err);
    return defaultValue;
  }
}

/**
 * Default CORS headers for edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Import getEnvWithDefault from envUtils
import { getEnvWithDefault } from '@/lib/env/envUtils';

// Re-export for convenience
export { getEnvWithDefault };

/**
 * Check if we're in a production environment
 */
export function isProduction(): boolean {
  const env = getEnv('NODE_ENV', '');
  return env === 'production';
}

/**
 * Get base URL for the current environment
 */
export function getBaseUrl(): string {
  return getEnv('VITE_APP_URL', 'http://localhost:8080');
}

/**
 * Safe environment variable getter that logs warnings for missing critical variables
 * @param key The environment variable key
 * @param defaultValue Default value if not found
 * @param required Whether this variable is critical (will log warning if missing)
 */
export function getSafeEnv(key: string, defaultValue: string = "", required: boolean = false): string {
  const value = getEnv(key, defaultValue);
  
  if (required && (value === defaultValue || value === "")) {
    console.warn(`⚠️ Critical environment variable ${key} is missing!`);
  }
  
  return value;
}
