
/**
 * Helper function to safely get environment variables with fallbacks
 */
export function getEnvVar(name: string, fallback: string = ""): string {
  try {
    // First try Deno.env if available (edge function context)
    if (typeof globalThis !== "undefined" && "Deno" in globalThis) {
      const deno = globalThis.Deno as any;
      if (deno?.env?.get) {
        const value = deno.env.get(name);
        return value !== undefined ? value : fallback;
      }
    }
    
    // Fallback to process.env for Node.js environments
    if (typeof process !== "undefined" && process.env) {
      const value = process.env[name];
      return value !== undefined ? value : fallback;
    }
    
    return fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

// Export CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
