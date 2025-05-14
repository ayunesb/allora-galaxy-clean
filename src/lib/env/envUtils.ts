
/**
 * Unified environment variable utilities for accessing environment variables
 * across different environments (browser, edge functions, Node.js)
 */

/**
 * Get an environment variable
 * @param key The name of the environment variable
 * @param required Whether the variable is required (throws error if not found)
 * @param defaultValue Optional default value if env var is not found and not required
 * @returns The value of the environment variable or defaultValue
 * @throws Error if required is true and the variable is not found
 */
export function ENV(
  key: string, 
  required: boolean = false, 
  defaultValue: string = ''
): string {
  // Try Deno.env in edge function context (highest priority)
  try {
    if (typeof globalThis !== 'undefined' && 
        'Deno' in globalThis && 
        typeof (globalThis as any).Deno?.env?.get === 'function') {
      const value = (globalThis as any).Deno.env.get(key);
      if (value !== undefined) return value;
      if (required) throw new Error(`Required environment variable ${key} is not set in Deno context`);
    }
  } catch (e) {
    if (required) throw new Error(`Failed to access required environment variable ${key}: ${e}`);
    console.debug(`Deno env not available for key ${key}`);
  }
  
  // Try Node.js process.env (second priority)
  try {
    if (typeof process !== 'undefined' && process.env) {
      const value = process.env[key];
      if (value !== undefined && value !== null) return value;
      if (required) throw new Error(`Required environment variable ${key} is not set in Node.js context`);
    }
  } catch (e) {
    if (required) throw new Error(`Failed to access required environment variable ${key}: ${e}`);
    console.debug(`process.env not available for key ${key}`);
  }
  
  // Try Vite import.meta.env (third priority)
  try {
    // @ts-ignore - import.meta.env is available in Vite
    if (import.meta && import.meta.env) {
      // @ts-ignore
      const value = import.meta.env[key];
      if (value !== undefined && value !== null) return value;
      if (required) throw new Error(`Required environment variable ${key} is not set in Vite context`);
    }
  } catch (e) {
    if (required) throw new Error(`Failed to access required environment variable ${key}: ${e}`);
    console.debug(`import.meta.env not available for key ${key}`);
  }
  
  if (required) {
    throw new Error(`Required environment variable ${key} is not available in any context`);
  }
  
  return defaultValue;
}

// Alias getEnv for backward compatibility
export const getEnv = ENV;
export const getEnvVar = ENV;

/**
 * Get an environment variable with a fallback value
 * @param key The name of the environment variable
 * @param defaultValue Fallback value if the env var is not found
 * @returns The value of the environment variable or the default value
 */
export function getEnvWithDefault(key: string, defaultValue: string): string {
  try {
    const value = ENV(key, false, '');
    return value !== '' ? value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Check if we're in a production environment
 */
export function isProduction(): boolean {
  const env = ENV('NODE_ENV');
  return env === 'production';
}

/**
 * Get base URL for the current environment
 */
export function getBaseUrl(): string {
  return getEnvWithDefault('VITE_APP_URL', 'http://localhost:8080');
}

/**
 * Safe environment variable getter that logs warnings for missing critical variables
 * @param key The environment variable key
 * @param defaultValue Default value if not found
 * @param required Whether this variable is critical (will log warning if missing)
 */
export function getSafeEnv(key: string, defaultValue: string = "", required: boolean = false): string {
  try {
    const value = ENV(key, required, defaultValue);
    
    if (required && (value === defaultValue || value === "")) {
      console.warn(`⚠️ Critical environment variable ${key} is missing!`);
    }
    
    return value;
  } catch (e) {
    console.error(`Failed to get environment variable ${key}:`, e);
    if (required) {
      throw e;
    }
    return defaultValue;
  }
}

// CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};
