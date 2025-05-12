
/**
 * Centralized environment variable handling with cross-platform support
 * 
 * This utility provides a unified approach to get environment variables in:
 * - Browser
 * - Edge functions
 * - Server environments
 * 
 * It enables safe fallbacks when variables are missing and works with both
 * import.meta.env (Vite) and process.env (Node.js, Deno) environments.
 */

// Get environment variables from any environment
export function getEnv(key: string): string | undefined {
  // Try browser environment first (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  
  // Try Deno environment - using a type-safe approach
  try {
    const deno = (globalThis as any).Deno;
    if (deno && typeof deno.env?.get === 'function') {
      return deno.env.get(key);
    }
  } catch (e) {
    // Ignore errors if Deno is not available
  }

  // Try Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  
  return undefined;
}

// Get environment variable with default value
export function getEnvWithDefault(key: string, defaultValue: string): string {
  const value = getEnv(key);
  return value !== undefined ? value : defaultValue;
}

// Check if an environment variable is truthy
export function isEnvTrue(key: string): boolean {
  const value = getEnv(key);
  if (!value) return false;
  
  return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
}

// Check if environment is development
export function isDevelopment(): boolean {
  const mode = getEnv('MODE') || getEnv('NODE_ENV');
  return mode === 'development';
}

// Check if environment is production
export function isProduction(): boolean {
  const mode = getEnv('MODE') || getEnv('NODE_ENV');
  return mode === 'production';
}

// Check if environment is test
export function isTest(): boolean {
  const mode = getEnv('MODE') || getEnv('NODE_ENV');
  return mode === 'test';
}

// Get all environment variables with a specific prefix
export function getEnvsByPrefix(prefix: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  // Browser environment (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith(prefix)) {
        result[key] = import.meta.env[key];
      }
    });
    return result;
  }
  
  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    Object.keys(process.env).forEach(key => {
      if (key.startsWith(prefix)) {
        result[key] = process.env[key] as string;
      }
    });
  }
  
  return result;
}

// Environment object for convenient access
export const ENV = {
  // Core application environment
  NODE_ENV: getEnvWithDefault('NODE_ENV', 'development'),
  APP_URL: getEnvWithDefault('VITE_APP_URL', 'http://localhost:3000'),
  
  // Supabase configuration
  SUPABASE_URL: getEnvWithDefault('VITE_SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getEnvWithDefault('VITE_SUPABASE_ANON_KEY', ''),
  SUPABASE_SERVICE_KEY: getEnvWithDefault('SUPABASE_SERVICE_ROLE_KEY', ''),
  
  // Integration APIs
  STRIPE_PUBLISHABLE_KEY: getEnvWithDefault('VITE_STRIPE_PUBLISHABLE_KEY', ''),
  OPENAI_API_KEY: getEnvWithDefault('OPENAI_API_KEY', ''),
  HUBSPOT_API_KEY: getEnvWithDefault('HUBSPOT_API_KEY', ''),
  
  // Analytics
  GA_MEASUREMENT_ID: getEnvWithDefault('VITE_GA_MEASUREMENT_ID', ''),
};

// CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Get base URL for the current environment
export function getBaseUrl(): string {
  return ENV.APP_URL;
}

// Safe environment variable getter that logs warnings for missing critical variables
export function getSafeEnv(key: string, defaultValue: string = "", required: boolean = false): string {
  const value = getEnv(key) || defaultValue;
  
  if (required && (value === defaultValue || value === "")) {
    console.warn(`⚠️ Critical environment variable ${key} is missing!`);
  }
  
  return value;
}

// For backward compatibility
export { getEnvWithDefault as getEnvVar };
