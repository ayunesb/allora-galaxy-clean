
/**
 * Custom error for when a requested resource is not found
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Custom error for validation failures
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Creates a standardized error response for edge functions
 */
export function createErrorResponse(message: string, status = 400, details?: any) {
  return new Response(
    JSON.stringify({
      error: message,
      details: details || null,
      success: false
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

/**
 * Handle various error types and return an appropriate response
 */
export function handleEdgeError(error: unknown): Response {
  if (error instanceof NotFoundError) {
    return createErrorResponse(error.message, 404);
  }
  
  if (error instanceof ValidationError) {
    return createErrorResponse(error.message, 400);
  }
  
  // For unknown errors, log them and return a generic error message
  console.error('Unexpected error in edge function:', error);
  
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
  return createErrorResponse(
    'An internal server error occurred',
    500,
    { originalError: errorMessage }
  );
}
