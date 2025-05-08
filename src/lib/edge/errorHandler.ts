
import { corsHeaders } from '@/lib/env';

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
    JSON.stringify({ 
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }),
    { 
      status: status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

export { corsHeaders };

/**
 * Create a standardized success response for edge functions
 */
export function createSuccessResponse(data: Record<string, any>) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
      timestamp: new Date().toISOString()
    }),
    { 
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}
