
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
  
  // Try Deno environment 
  if (typeof Deno !== 'undefined' && Deno.env && typeof Deno.env.get === 'function') {
    return Deno.env.get(key);
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
