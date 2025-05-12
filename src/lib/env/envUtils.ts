
/**
 * Environment utilities for client and edge functions
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Environment categories
 */
export enum ENV {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * Get environment variable with strict type checking
 * @param name The environment variable name
 * @throws Error if the environment variable is not defined
 */
export function getEnv(name: string): string {
  // For Vite, we use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[name] || import.meta.env[`VITE_${name}`];
    if (value) return value;
  }
  
  // For Node.js, use process.env
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[name];
    if (value) return value;
  }
  
  throw new Error(`Environment variable ${name} is not defined`);
}

/**
 * Get environment variable with fallback value
 * @param name The environment variable name
 * @param defaultValue The default value to return if not found
 */
export function getEnvWithDefault(name: string, defaultValue: string): string {
  try {
    return getEnv(name);
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Check if environment variable is true
 * @param name The environment variable name
 */
export function isEnvTrue(name: string): boolean {
  try {
    const value = getEnv(name).toLowerCase();
    return value === 'true' || value === '1' || value === 'yes';
  } catch (e) {
    return false;
  }
}

/**
 * Check if current environment is development
 */
export function isDevelopment(): boolean {
  try {
    const mode = getEnvWithDefault('NODE_ENV', '').toLowerCase();
    return mode === 'development' || mode === 'dev';
  } catch (e) {
    return false;
  }
}

/**
 * Check if current environment is production
 */
export function isProduction(): boolean {
  try {
    const mode = getEnvWithDefault('NODE_ENV', '').toLowerCase();
    return mode === 'production' || mode === 'prod';
  } catch (e) {
    return false;
  }
}

/**
 * Check if current environment is test
 */
export function isTest(): boolean {
  try {
    const mode = getEnvWithDefault('NODE_ENV', '').toLowerCase();
    return mode === 'test';
  } catch (e) {
    return false;
  }
}

/**
 * Get all environment variables with a specified prefix
 * @param prefix The prefix to filter environment variables
 */
export function getEnvsByPrefix(prefix: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  // For Vite, use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith(prefix)) {
        result[key] = import.meta.env[key];
      }
    });
  }
  
  // For Node.js, use process.env
  if (typeof process !== 'undefined' && process.env) {
    Object.keys(process.env).forEach(key => {
      if (key.startsWith(prefix)) {
        result[key] = process.env[key] || '';
      }
    });
  }
  
  return result;
}

/**
 * Get the base URL for the current environment
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // For Node.js or edge functions
  return getEnvWithDefault('VITE_PUBLIC_URL', 'http://localhost:3000');
}

/**
 * Safely get environment variable with clean error handling
 */
export function getSafeEnv(name: string, defaultValue: string = ''): string {
  try {
    return getEnv(name);
  } catch (error) {
    console.warn(`Failed to get environment variable ${name}:`, error);
    return defaultValue;
  }
}
