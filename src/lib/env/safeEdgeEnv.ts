
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
    // Use globalThis for safer Deno access
    if (typeof globalThis !== "undefined" && 
        typeof (globalThis as any).Deno !== "undefined" && 
        typeof (globalThis as any).Deno.env !== "undefined" && 
        (globalThis as any).Deno.env) {
      return (globalThis as any).Deno.env.get(name) ?? fallback;
    }
    
    // Fallback to process.env for non-Deno environments
    // @ts-ignore - process.env may not exist in all contexts
    return typeof process !== "undefined" && process.env ? (process.env[name] || fallback) : fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
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
