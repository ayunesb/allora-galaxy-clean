/**
 * Error handling utilities for edge functions
 */

// CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};

// Standard error response interface
export interface ErrorResponseData {
  error: string;
  message?: string;
  details?: any;
  status: number;
  request_id?: string;
  timestamp?: string;
  code?: string;
}

// Standard success response interface
export interface SuccessResponseData {
  data: any;
  status: number;
  message?: string;
  request_id?: string;
  timestamp?: string;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: Error | string,
  status: number = 500,
  details?: any,
  requestId?: string
): Response {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const responseBody: ErrorResponseData = {
    error: errorMessage,
    status,
    request_id: requestId || generateRequestId(),
    timestamp: new Date().toISOString(),
  };
  
  if (details) {
    responseBody.details = details;
  }
  
  // Add error code if it exists
  if (typeof error !== 'string' && (error as any).code) {
    responseBody.code = (error as any).code;
  }
  
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse(
  data: any,
  status: number = 200,
  message?: string,
  requestId?: string
): Response {
  const responseBody: SuccessResponseData = {
    data,
    status,
    request_id: requestId || generateRequestId(),
    timestamp: new Date().toISOString(),
  };
  
  if (message) {
    responseBody.message = message;
  }
  
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }
  return null;
}

/**
 * Universal error handler with additional context
 * Enhanced with more detailed logging and standardized error formats
 */
export function enhancedErrorHandler(
  error: any,
  requestId?: string,
  context: Record<string, any> = {}
): Response {
  const status = determineErrorStatus(error);
  const errorCode = extractErrorCode(error);
  const requestIdToUse = requestId || generateRequestId();
  
  // Log the error with context for better debugging
  console.error(`[${requestIdToUse}] Error:`, {
    message: error.message || String(error),
    status,
    code: errorCode,
    context,
    stack: error.stack
  });
  
  const responseBody: ErrorResponseData = {
    error: error.message || String(error),
    status,
    request_id: requestIdToUse,
    timestamp: new Date().toISOString(),
  };
  
  if (errorCode) {
    responseBody.code = errorCode;
  }
  
  if (error.details || context) {
    responseBody.details = {
      ...error.details,
      ...context
    };
  }
  
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Determine appropriate HTTP status code based on error type
 */
function determineErrorStatus(error: any): number {
  // Use explicit status if provided
  if (error.status && typeof error.status === 'number') {
    return error.status;
  }
  
  // Determine status from error code or message
  const errorMessage = (error.message || '').toLowerCase();
  const errorCode = (error.code || '').toLowerCase();
  
  // Auth errors
  if (
    errorCode.includes('auth/') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('unauthenticated') ||
    errorCode.includes('unauthorized')
  ) {
    return 401;
  }
  
  // Permission errors
  if (
    errorCode.includes('permission') ||
    errorMessage.includes('permission') ||
    errorMessage.includes('forbidden') ||
    errorCode.includes('forbidden')
  ) {
    return 403;
  }
  
  // Not found errors
  if (
    errorCode.includes('not_found') ||
    errorMessage.includes('not found') ||
    errorCode === '404'
  ) {
    return 404;
  }
  
  // Validation errors
  if (
    errorCode.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('validation')
  ) {
    return 400;
  }
  
  // Conflict errors
  if (
    errorCode.includes('conflict') ||
    errorMessage.includes('already exists') ||
    errorMessage.includes('duplicate')
  ) {
    return 409;
  }
  
  // Rate limiting
  if (
    errorCode.includes('rate_limit') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests')
  ) {
    return 429;
  }
  
  // Default to server error
  return 500;
}

/**
 * Extract standardized error code from various error formats
 */
function extractErrorCode(error: any): string | undefined {
  if (error.code) {
    return error.code;
  }
  
  // Extract code from Supabase error format
  if (error.name === 'PostgrestError' && error.code) {
    return `db_${error.code}`;
  }
  
  // Extract from message pattern like "[CODE_123] Message"
  const codeMatch = /\[([\w_]+)\]/.exec(error.message || '');
  if (codeMatch) {
    return codeMatch[1];
  }
  
  return undefined;
}

/**
 * Parse JSON request body with validation and error handling
 */
export async function parseAndValidateBody<T>(
  req: Request,
  requiredFields: string[] = []
): Promise<[T | null, ErrorResponseData | null]> {
  try {
    const body = await req.json() as T;
    
    // Validate required fields if specified
    if (requiredFields.length > 0) {
      const missingFields = requiredFields.filter(field => {
        const value = (body as any)[field];
        return value === undefined || value === null || value === '';
      });
      
      if (missingFields.length > 0) {
        return [
          null,
          {
            error: 'Missing required fields',
            message: `The following fields are required: ${missingFields.join(', ')}`,
            status: 400,
            request_id: generateRequestId(),
            timestamp: new Date().toISOString(),
            details: { missingFields }
          }
        ];
      }
    }
    
    return [body, null];
  } catch (error) {
    return [
      null,
      {
        error: 'Invalid request body',
        message: error instanceof Error ? error.message : 'Could not parse JSON',
        status: 400,
        request_id: generateRequestId(),
        timestamp: new Date().toISOString()
      }
    ];
  }
}

/**
 * Wrapper for safe execution with retry logic
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    useExponentialBackoff?: boolean;
    shouldRetry?: (error: any, attempt: number) => boolean;
    onRetry?: (attempt: number, error: any, nextDelay: number) => void;
    context?: string;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 500,
    useExponentialBackoff = true,
    shouldRetry = () => true,
    onRetry = () => {},
    context = 'operation'
  } = options;
  
  let attempt = 0;
  let lastError: any;
  
  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempt++;
      
      // If we've reached max retries or should not retry, throw the error
      if (attempt > maxRetries || !shouldRetry(error, attempt)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff if enabled
      const delay = useExponentialBackoff
        ? initialDelay * Math.pow(2, attempt - 1) + Math.random() * 500
        : initialDelay;
      
      console.warn(
        `Attempt ${attempt}/${maxRetries} failed for ${context}. ` +
        `Retrying in ${Math.round(delay)}ms. Error: ${error.message || String(error)}`
      );
      
      onRetry(attempt, error, delay);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached but TypeScript requires it
  throw lastError;
}

/**
 * Universal error handler for edge functions
 */
export function errorHandler(error: any, requestId?: string): Response {
  console.error(`Edge function error [${requestId || 'no-id'}]:`, error);
  
  const status = error.status || 500;
  const message = error.message || 'Internal server error';
  
  return createErrorResponse(message, status, undefined, requestId);
}

/**
 * Handle execution errors in edge functions with detailed logging
 */
export function handleExecutionError(error: any, requestId?: string): Response {
  console.error(`Execution error [${requestId || 'no-id'}]:`, error);
  
  // Determine appropriate status code based on error type/code
  let status = 500;
  if (error.status) {
    status = error.status;
  } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-token') {
    status = 401;
  } else if (error.code === 'auth/permission-denied' || error.code === 'permission-denied') {
    status = 403;
  } else if (error.code === 'not-found') {
    status = 404;
  } else if (error.code === 'already-exists') {
    status = 409;
  } else if (error.code === 'resource-exhausted') {
    status = 429;
  }
  
  return createErrorResponse(
    error.message || 'Execution error',
    status,
    error.details || error.stack,
    requestId
  );
}

/**
 * Safe wrapper for edge function execution
 * @param handler The function handler to execute
 * @param requestId Optional request ID for tracking
 * @returns The response from the handler or an error response
 */
export async function safeExecute<T>(
  handler: () => Promise<T>, 
  requestId?: string
): Promise<T | Response> {
  try {
    return await handler();
  } catch (error) {
    return handleExecutionError(error, requestId);
  }
}

/**
 * Safely parse JSON request body with error handling
 * @param req The request object
 * @returns Tuple containing [parsed data, error]
 */
export async function safeParseJsonBody<T>(req: Request): Promise<[T | null, Error | null]> {
  try {
    const body = await req.json() as T;
    return [body, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
