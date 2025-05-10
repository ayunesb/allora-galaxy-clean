
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
  }
  
  // Try process.env (Node.js) as fallback
  try {
    const value = (process.env as any)[name];
    if (value !== undefined && value !== null) {
      return value;
    }
  } catch (e) {
    // Silently fail and return fallback
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
