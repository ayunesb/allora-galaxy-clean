
import { createCorsResponse } from './envManager';
import { corsHeaders } from '@/lib/env/envUtils';

/**
 * Handle errors in edge functions
 */
export function handleEdgeFunctionError(error: unknown): Response {
  console.error('Edge function error:', error);
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'Unknown error occurred';
  
  return new Response(
    JSON.stringify({ 
      error: errorMessage,
      success: false 
    }),
    { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

/**
 * Send validation error response
 */
export function sendValidationError(message: string): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message
    }),
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

/**
 * Send authentication error response
 */
export function sendAuthError(): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Unauthorized'
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

/**
 * Send success response with data
 */
export function sendSuccessResponse(data: any): Response {
  return createCorsResponse({
    success: true,
    data
  });
}
