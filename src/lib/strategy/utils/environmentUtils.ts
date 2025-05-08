
/**
 * Utilities for safely handling environment variables across different environments
 */

/**
 * Helper function to safely get environment variables with fallbacks
 */
export function getEnv(name: string, fallback: string = ""): string {
  try {
    // Use a more TypeScript-friendly approach to check for Deno environment
    const isDeno = typeof globalThis !== "undefined" && 
                  "Deno" in globalThis && 
                  typeof (globalThis as any).Deno !== "undefined" && 
                  "env" in (globalThis as any).Deno;
                  
    if (isDeno) {
      return ((globalThis as any).Deno).env.get(name) ?? fallback;
    }
    
    return process.env[name] || fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

/**
 * Safely access Deno environment in edge functions
 */
export function safeGetDenoEnv(name: string): string | undefined {
  try {
    if (typeof globalThis !== 'undefined' && 
        'Deno' in globalThis && 
        typeof (globalThis as any).Deno?.env?.get === 'function') {
      return (globalThis as any).Deno.env.get(name);
    }
  } catch (e) {
    console.error(`Error accessing Deno env: ${e}`);
  }
  return undefined;
}
