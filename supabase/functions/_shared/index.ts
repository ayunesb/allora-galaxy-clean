
// Re-export all utilities from the CORS module
export * from './cors';

// Add environment utility functions
export const getEnvOrThrow = (name: string): string => {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const getEnvWithDefault = (name: string, defaultValue: string): string => {
  return Deno.env.get(name) || defaultValue;
};

// Error handling utilities
export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  status?: number;
}

export const createErrorResponse = (
  message: string, 
  status: number = 500, 
  details?: any
): Response => {
  const errorBody: ErrorResponse = {
    success: false,
    error: message,
    details,
    status
  };
  
  return new Response(JSON.stringify(errorBody), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
};

// Define corsHeaders directly in this file to avoid import issues
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};
