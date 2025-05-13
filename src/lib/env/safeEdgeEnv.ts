
/**
 * Safely get Deno environment variables with fallbacks
 * This is used in edge functions where Deno.env is available
 */

/**
 * Safely get a Deno environment variable with fallback
 * @param key Environment variable name
 * @param fallback Optional fallback value if not found
 * @returns The environment variable value or fallback
 */
export function safeGetDenoEnv(key: string, fallback: string = ""): string {
  try {
    // Use type assertion here for Deno environment
    const deno = (globalThis as any).Deno;
    if (deno && typeof deno.env?.get === "function") {
      return deno.env.get(key) ?? fallback;
    }
    return fallback;
  } catch (err) {
    console.warn(`Error accessing Deno env variable ${key}:`, err);
    return fallback;
  }
}

/**
 * Get edge function environment variables with consistent fallback behavior
 * Works in both Deno and Node environments
 */
export function getEdgeEnv(key: string, fallback: string = ""): string {
  // Try Deno.env first
  let value = safeGetDenoEnv(key);
  if (value) return value;
  
  // Fall back to Node.js process.env if available
  try {
    if (typeof process !== 'undefined' && process.env) {
      value = process.env[key] ?? fallback;
      if (value) return value;
    }
  } catch (e) {
    console.warn(`Error accessing Node env variable ${key}:`, e);
  }
  
  return fallback;
}

/**
 * Get the current environment (production, development, etc)
 */
export function getEdgeEnvironment(): string {
  return getEdgeEnv('NODE_ENV', 'development');
}
