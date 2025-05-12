
/**
 * Environment utilities for consistent environment variable access
 */

/**
 * Get an environment variable
 * @param name Variable name
 * @param fallback Optional fallback value
 * @returns Environment variable value or fallback
 */
export function getEnv(name: string, fallback: string = ""): string {
  try {
    // For Deno environment
    if (typeof Deno !== "undefined" && typeof Deno.env !== "undefined" && Deno.env) {
      return Deno.env.get(name) ?? fallback;
    }
    
    // For browser environment with import.meta.env
    // @ts-ignore - import.meta.env may not exist in all contexts
    if (typeof import.meta !== "undefined" && import.meta.env) {
      // @ts-ignore - dynamic access
      const value = import.meta.env[name] || import.meta.env[`VITE_${name}`];
      return value || fallback;
    }
    
    // For Node.js environment
    // @ts-ignore - process.env may not exist in all contexts
    if (typeof process !== "undefined" && process.env) {
      // @ts-ignore - dynamic access
      return process.env[name] || fallback;
    }
    
    return fallback;
  } catch (error) {
    console.error(`Error accessing environment variable ${name}:`, error);
    return fallback;
  }
}

/**
 * Get an environment variable with default value
 * @param name Variable name
 * @param defaultValue Default value
 * @returns Environment variable value or default
 */
export function getEnvWithDefault<T>(name: string, defaultValue: T): string | T {
  const value = getEnv(name);
  return value || defaultValue;
}

/**
 * Check if environment variable is true
 * @param name Variable name
 * @param defaultValue Default value
 * @returns Boolean value
 */
export function isEnvTrue(name: string, defaultValue: boolean = false): boolean {
  const value = getEnv(name).toLowerCase();
  if (!value) return defaultValue;
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Check if current environment is development
 * @returns True if development environment
 */
export function isDevelopment(): boolean {
  const nodeEnv = getEnv('NODE_ENV').toLowerCase();
  return nodeEnv === '' || nodeEnv === 'development';
}

/**
 * Check if current environment is test
 * @returns True if test environment
 */
export function isTest(): boolean {
  return getEnv('NODE_ENV').toLowerCase() === 'test';
}

/**
 * Check if current environment is production
 * @returns True if production environment
 */
export function isProduction(): boolean {
  return getEnv('NODE_ENV').toLowerCase() === 'production';
}

/**
 * Get environment variables by prefix
 * @param prefix Variables prefix
 * @returns Object with variables
 */
export function getEnvsByPrefix(prefix: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  try {
    // For browser environment with import.meta.env
    // @ts-ignore - import.meta.env may not exist in all contexts
    if (typeof import.meta !== "undefined" && import.meta.env) {
      // @ts-ignore - Object.entries may not be available
      Object.entries(import.meta.env).forEach(([key, value]) => {
        if (key.startsWith(prefix) || key.startsWith(`VITE_${prefix}`)) {
          const newKey = key.startsWith('VITE_') ? key.substring(5) : key;
          result[newKey] = String(value);
        }
      });
    }
    
    // For Node.js environment
    // @ts-ignore - process.env may not exist in all contexts
    if (typeof process !== "undefined" && process.env) {
      // @ts-ignore - Object.entries may not be available
      Object.entries(process.env).forEach(([key, value]) => {
        if (key.startsWith(prefix)) {
          result[key] = String(value);
        }
      });
    }
  } catch (error) {
    console.error(`Error getting environment variables with prefix ${prefix}:`, error);
  }
  
  return result;
}

/**
 * Get a safe environment variable (no error if not found)
 * @param name Variable name
 * @param fallback Optional fallback value
 * @returns Environment variable value or fallback
 */
export function getSafeEnv(name: string, fallback: string = ""): string {
  try {
    return getEnv(name, fallback);
  } catch (error) {
    return fallback;
  }
}

/**
 * Get base URL from environment or default
 * @returns Base URL string
 */
export function getBaseUrl(): string {
  return getEnv('BASE_URL', getEnv('VITE_BASE_URL', window?.location?.origin || ''));
}

// Environment variables constants
export const ENV = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  BASE_URL: getBaseUrl(),
  API_URL: getEnv('API_URL', getEnv('VITE_API_URL', '')),
  SUPABASE_URL: getEnv('SUPABASE_URL', getEnv('VITE_SUPABASE_URL', '')),
  SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY', getEnv('VITE_SUPABASE_ANON_KEY', ''))
};

// CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
