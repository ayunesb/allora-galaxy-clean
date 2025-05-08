
/**
 * Safely gets environment variables across different runtimes (Node.js, Deno, browser)
 */
export function getEnvVar(key: string, defaultValue: string = ""): string {
  try {
    // Check for Deno environment
    if (typeof globalThis !== "undefined" && 
        "Deno" in globalThis && 
        globalThis.Deno && 
        "env" in globalThis.Deno && 
        typeof globalThis.Deno.env?.get === "function") {
      return globalThis.Deno.env.get(key) || defaultValue;
    }
    
    // Check for Node.js environment
    if (typeof process !== "undefined" && process.env && key in process.env) {
      return process.env[key] || defaultValue;
    }
    
    // Check for browser environment with window.env
    if (typeof window !== "undefined" && "env" in window && window.env && key in window.env) {
      return (window.env as Record<string, string>)[key] || defaultValue;
    }
    
    return defaultValue;
  } catch (error) {
    console.warn(`Error accessing environment variable ${key}:`, error);
    return defaultValue;
  }
}

// CORS headers for Edge functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
