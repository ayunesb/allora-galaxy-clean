import { corsHeaders } from '@/lib/env/envUtils';

// Re-export corsHeaders for use in edge functions
export { corsHeaders };

/**
 * Error handler for edge functions
 * @param err The error object
 * @returns A JSON response with the error message and a 500 status code
 */
export function errorHandler(err: any) {
  console.error('Edge Function Error:', err);
  
  const message = err.message || 'Internal Server Error';
  const status = err.status || 500;
  
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}
