
/**
 * Safely get environment variables in a Deno Edge Function environment
 * with proper fallbacks for non-edge contexts
 */

/**
 * Safely get a Deno environment variable with fallback
 * @param name Environment variable name
 * @param fallback Fallback value if not found
 * @returns Environment variable value or fallback
 */
export function safeGetDenoEnv(name: string, fallback: string = ""): string {
  try {
    // First try Deno.env if available
    if (typeof Deno !== "undefined" && typeof Deno.env !== "undefined" && Deno.env) {
      return Deno.env.get(name) ?? fallback;
    }
    // Fallback to process.env for non-Deno environments
    // @ts-ignore - process.env may not exist in all contexts
    return typeof process !== "undefined" && process.env ? (process.env[name] || fallback) : fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

/**
 * Get environment variable for edge function with consistent fallback handling
 * @param name Environment variable name
 * @param fallback Fallback value if not found
 * @returns Environment variable value or fallback
 */
export function getEdgeEnv(name: string, fallback: string = ""): string {
  return safeGetDenoEnv(name, fallback);
}

/**
 * Get the current edge function environment (development, test, production)
 * @returns Current environment name
 */
export function getEdgeEnvironment(): 'development' | 'test' | 'production' {
  const env = safeGetDenoEnv("NODE_ENV", "development");
  
  if (env === 'test') return 'test';
  if (env === 'production') return 'production';
  return 'development';
}
