
/**
 * Standard CORS headers for Supabase Edge Functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Format standard API error response
 * @param status HTTP status code
 * @param message Error message
 * @param details Additional error details
 * @returns Response object with error details
 */
export function formatErrorResponse(
  status: number,
  message: string,
  details?: any
): Response {
  const body = {
    success: false,
    error: message,
    details: details || null,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
