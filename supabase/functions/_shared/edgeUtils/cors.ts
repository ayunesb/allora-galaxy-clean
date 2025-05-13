
/**
 * CORS utilities for Supabase Edge Functions
 */

// Standard CORS headers to be used across all edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Handle CORS preflight requests
 * @param req - Request object from edge function handler
 * @returns Response object for preflight requests or null for normal requests
 */
export function handleCorsRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }
  return null;
}

/**
 * Apply CORS headers to an existing response
 * @param response - Original response
 * @returns Response with CORS headers
 */
export function applyCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // Return new response with CORS headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
