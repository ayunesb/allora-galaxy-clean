
/**
 * Safe environment utilities for edge functions (Deno environment)
 */

// Define a simple type for the Deno global to avoid TypeScript errors
declare global {
  interface DenoNamespace {
    env: {
      get(key: string): string | undefined;
    };
  }
  
  var Deno: DenoNamespace | undefined;
}

/**
 * Safely get Deno environment variable with fallback
 * @param name The environment variable name
 * @param fallback Default value if not found
 */
export function safeGetDenoEnv(name: string, fallback: string = ""): string {
  try {
    // First try Deno.env if available
    if (typeof globalThis !== "undefined" && 
        typeof (globalThis as any).Deno !== "undefined" && 
        (globalThis as any).Deno?.env) {
      return (globalThis as any).Deno.env.get(name) || fallback;
    }
    // Fallback to process.env for non-Deno environments
    return process.env[name] || fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

/**
 * Get environment variable for edge functions with unified interface
 * @param name The environment variable name
 * @param defaultValue Default value if not found
 */
export function getEdgeEnv(name: string, defaultValue: string = ""): string {
  // Try Deno environment first
  const denoValue = safeGetDenoEnv(name);
  if (denoValue) return denoValue;
  
  // Try Node.js process.env as fallback
  if (typeof process !== "undefined" && process.env) {
    return process.env[name] || defaultValue;
  }
  
  return defaultValue;
}

/**
 * Get the current environment (development, production, test)
 */
export function getEdgeEnvironment(): string {
  return getEdgeEnv("ENVIRONMENT", "development");
}
