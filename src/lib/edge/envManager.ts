
import { createClient } from '@supabase/supabase-js';
import { getEnv } from '@/lib/env/envUtils';
import { corsHeaders } from '@/lib/env/envUtils';

/**
 * Get environment variable with appropriate fallback
 */
export function getEdgeEnv(key: string, fallback = ''): string {
  if (typeof Deno !== 'undefined') {
    return Deno.env.get(key) || fallback;
  }
  
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  
  return fallback;
}

/**
 * Create authenticated Supabase client for edge functions
 */
export function createEdgeSupabaseClient(authHeader?: string) {
  const supabaseUrl = getEdgeEnv('SUPABASE_URL');
  const supabaseKey = authHeader ? getEdgeEnv('SUPABASE_SERVICE_ROLE_KEY') : getEdgeEnv('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials for edge function');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
}

/**
 * Create a Response with CORS headers for edge functions
 */
export function createCorsResponse(
  body: any,
  status = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...additionalHeaders,
    },
  });
}

/**
 * Create error response with CORS headers
 */
export function createErrorResponse(
  message: string,
  status = 400
): Response {
  return createCorsResponse({ error: message }, status);
}
