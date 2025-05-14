
/**
 * @file CORS Headers
 * Standard CORS headers for Supabase Edge Functions
 * 
 * This module provides consistent CORS (Cross-Origin Resource Sharing) headers
 * to be applied to all edge function responses, enabling secure cross-origin requests.
 */

/**
 * Standard CORS headers for Supabase Edge Functions
 * 
 * These headers enable secure cross-origin access to the API by:
 * - Allowing requests from any origin with 'Access-Control-Allow-Origin: *'
 * - Permitting necessary headers for Supabase authentication and API usage
 * - Supporting API key, authorization, and content-type headers
 * 
 * @example
 * ```typescript
 * import { corsHeaders } from '../lib/corsHeaders';
 * 
 * // Handle CORS preflight requests
 * if (req.method === 'OPTIONS') {
 *   return new Response(null, { headers: corsHeaders });
 * }
 * 
 * // Add CORS headers to normal response
 * return new Response(JSON.stringify({ success: true, data }), {
 *   headers: { ...corsHeaders, 'Content-Type': 'application/json' },
 * });
 * ```
 */
export const corsHeaders = {
  /**
   * Allow requests from any origin
   * In production, consider restricting to specific domains
   */
  "Access-Control-Allow-Origin": "*",
  
  /**
   * Allow specific headers required for Supabase and API functionality:
   * - authorization: For authentication tokens
   * - x-client-info: For Supabase client identification
   * - apikey: For API key authentication
   * - content-type: For JSON and form data
   */
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
