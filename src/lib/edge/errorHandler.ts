
import { toast } from '@/hooks/use-toast';

/**
 * Standard error types for edge functions
 */
export enum EdgeErrorType {
  VALIDATION = 'validation_error',
  AUTHENTICATION = 'authentication_error',
  AUTHORIZATION = 'authorization_error',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  RATE_LIMIT = 'rate_limit_error',
  DEPENDENCY_ERROR = 'dependency_error',
}

/**
 * Standard error response format for edge functions
 */
export interface EdgeErrorResponse {
  error: {
    type: EdgeErrorType;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Standard options for handling errors
 */
export interface ErrorHandlerOptions {
  logToConsole?: boolean;
  logToSystem?: boolean;
  showToast?: boolean;
}

/**
 * Handles errors from edge functions in a standardized way
 */
export function handleEdgeError(
  error: any,
  options: ErrorHandlerOptions = { 
    logToConsole: true,
    logToSystem: true,
    showToast: true
  }
): EdgeErrorResponse {
  const { logToConsole, showToast } = options;
  
  // Determine the error type
  let errorType = EdgeErrorType.SERVER_ERROR;
  let errorMessage = 'An unexpected error occurred';
  let errorDetails = {};
  
  if (error instanceof Response) {
    // Handle Response objects
    errorType = EdgeErrorType.DEPENDENCY_ERROR;
    errorMessage = `API returned status ${error.status}`;
  } else if (error instanceof Error) {
    // Handle standard Error objects
    errorMessage = error.message;
    errorDetails = { 
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  } else if (typeof error === 'string') {
    // Handle string errors
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    // Handle object errors with properties
    errorMessage = error.message || 'Unknown error';
    if (error.type) errorType = error.type;
    errorDetails = { ...error };
  }

  // Log to console if needed
  if (logToConsole) {
    console.error('[Edge Error]', errorType, errorMessage, error);
  }
  
  // Show toast if needed
  if (showToast) {
    toast({
      variant: 'destructive',
      title: 'Operation failed',
      description: errorMessage
    });
  }

  // Return standardized error response
  return {
    error: {
      type: errorType,
      message: errorMessage,
      details: errorDetails
    }
  };
}
