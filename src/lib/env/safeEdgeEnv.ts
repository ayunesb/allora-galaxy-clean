
/**
 * Utilities for safely accessing environment variables in edge functions
 */

/**
 * Safely gets a Deno environment variable with fallback
 * @param name The name of the environment variable
 * @param fallback Optional fallback value if environment variable is not found
 * @returns The environment variable value or the fallback
 */
export function safeGetDenoEnv(name: string, fallback: string = ''): string {
  try {
    // Use type assertion here for Deno environment
    const deno = (globalThis as any).Deno;
    if (deno && typeof deno.env?.get === "function") {
      return deno.env.get(name) ?? fallback;
    }
    return fallback;
  } catch (err) {
    console.warn(`Error accessing Deno env variable ${name}:`, err);
    return fallback;
  }
}

/**
 * Gets environment variables in edge function context with proper fallback handling
 * @param name The name of the environment variable
 * @param fallback Optional fallback value if environment variable is not found
 * @returns The environment variable value or the fallback
 */
export function getEdgeEnv(name: string, fallback: string = ''): string {
  // Try Deno.env first (edge functions)
  try {
    const deno = (globalThis as any).Deno;
    if (deno && typeof deno.env?.get === "function") {
      const value = deno.env.get(name);
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  } catch (e) {
    // Silently fail and try next method
    console.debug(`Edge env: Deno.env not available for ${name}, trying process.env`);
  }
  
  // Try process.env (Node.js) as fallback
  try {
    if (typeof process !== 'undefined' && process.env) {
      const value = (process.env as any)[name];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  } catch (e) {
    // Silently fail and return fallback
    console.debug(`Edge env: process.env not available for ${name}, using fallback`);
  }
  
  // Return fallback if all attempts fail
  return fallback;
}

/**
 * Gets the current environment (development, production, etc.)
 * Works in both Deno and Node.js environments
 */
export function getEdgeEnvironment(): 'development' | 'production' | 'test' {
  const env = getEdgeEnv('NODE_ENV', 'development');
  
  if (env === 'production') return 'production';
  if (env === 'test') return 'test';
  return 'development';
}

/**
 * Helper function to safely get Deno environment variable
 * This handles both Supabase Edge Functions and local development
 */
export function getDenoEnv(name: string, defaultValue: string = ''): string {
  return safeGetDenoEnv(name, defaultValue);
}

/**
 * Validate existence of required environment variables
 * Throws an error if any required variable is missing
 */
export function validateRequiredEnv(requiredVars: string[]): void {
  const missing: string[] = [];
  
  requiredVars.forEach(name => {
    const value = getEdgeEnv(name);
    if (!value) missing.push(name);
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
