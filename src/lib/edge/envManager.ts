
/**
 * Common utilities for Supabase edge functions
 */

/**
 * Helper function to safely get environment variables with fallbacks
 */
export function getEnvVar(name: string, fallback: string = ""): string {
  try {
    // First try Deno.env if available (edge function context)
    if (typeof globalThis !== "undefined" && "Deno" in globalThis) {
      const deno = globalThis.Deno as any;
      if (deno?.env?.get) {
        return deno.env.get(name) ?? fallback;
      }
    }
    // Fallback to process.env for Node.js environments
    return process.env[name] || fallback;
  } catch (err) {
    console.warn(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

/**
 * Format a standard error response for edge functions
 */
export function formatErrorResponse(
  status: number, 
  message: string, 
  details?: string, 
  executionTime?: number
): Response {
  const headers = {
    "Access-Control-Allow-Origin": "*", 
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json"
  };
  
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details: details || undefined,
      execution_time: executionTime,
      timestamp: new Date().toISOString()
    }),
    { 
      status,
      headers
    }
  );
}

/**
 * Format a standard success response for edge functions
 */
export function formatSuccessResponse(data: any, executionTime?: number): Response {
  const headers = {
    "Access-Control-Allow-Origin": "*", 
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json"
  };
  
  return new Response(
    JSON.stringify({
      success: true,
      data,
      execution_time: executionTime,
      timestamp: new Date().toISOString()
    }),
    { 
      status: 200,
      headers
    }
  );
}
