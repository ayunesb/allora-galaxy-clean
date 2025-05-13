
/**
 * Environment variable utilities for both browser and edge runtime environments.
 * This module abstracts the differences between Deno.env and process.env,
 * allowing for safer environment variable access in edge functions and browser code.
 */

interface EnvManager {
  get: (key: string) => string | undefined;
  isDeno: boolean;
  isNode: boolean;
  isBrowser: boolean;
}

/**
 * Safe environment variable getter that works across browser, Node.js and Deno.
 * Falls back to process.env if Deno.env is not available.
 */
const getEnvValue = (key: string): string | undefined => {
  try {
    // Check if running in Deno environment
    // @ts-ignore - Deno might not be defined in all environments
    if (typeof Deno !== 'undefined' && Deno?.env?.get) {
      // @ts-ignore - Deno might not be defined in all environments
      return Deno.env.get(key);
    }
    
    // Check if running in Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Silently fail if neither environment is available
    console.warn(`Failed to access environment variable: ${key}`);
  }
  
  return undefined;
};

/**
 * Environment manager that provides a consistent API for accessing environment
 * variables across different JavaScript runtimes.
 */
export const envManager: EnvManager = {
  get: getEnvValue,
  // @ts-ignore - Deno might not be defined in all environments
  isDeno: typeof Deno !== 'undefined',
  isNode: typeof process !== 'undefined' && process.env !== undefined,
  isBrowser: typeof window !== 'undefined',
};

/**
 * Get an environment variable with type safety.
 * @param key The environment variable key
 * @param defaultValue Optional default value if environment variable is not set
 */
export const getEnv = (key: string, defaultValue?: string): string | undefined => {
  const value = envManager.get(key);
  return value !== undefined ? value : defaultValue;
};

/**
 * Get a boolean environment variable.
 * @param key The environment variable key
 * @param defaultValue Optional default value if environment variable is not set
 */
export const getBoolEnv = (key: string, defaultValue = false): boolean => {
  const value = envManager.get(key);
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * Get a numeric environment variable.
 * @param key The environment variable key
 * @param defaultValue Optional default value if environment variable is not set
 */
export const getNumEnv = (key: string, defaultValue?: number): number | undefined => {
  const value = envManager.get(key);
  if (value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};
