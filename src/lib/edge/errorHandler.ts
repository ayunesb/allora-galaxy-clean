
/**
 * Centralized error handling for edge functions
 */

// Error codes for better categorization
export enum EdgeErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

// Error class with standardized structure
export class EdgeError extends Error {
  code: EdgeErrorCode;
  status: number;
  details?: Record<string, any>;

  constructor(message: string, code: EdgeErrorCode, status: number = 500, details?: Record<string, any>) {
    super(message);
    this.name = 'EdgeError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  // Convert to JSON for response
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

// Common error factory methods
export const createValidationError = (message: string, details?: Record<string, any>) => {
  return new EdgeError(message, EdgeErrorCode.VALIDATION_ERROR, 400, details);
};

export const createAuthenticationError = (message: string = 'Authentication required') => {
  return new EdgeError(message, EdgeErrorCode.AUTHENTICATION_ERROR, 401);
};

export const createAuthorizationError = (message: string = 'Permission denied') => {
  return new EdgeError(message, EdgeErrorCode.AUTHORIZATION_ERROR, 403);
};

export const createNotFoundError = (resource: string) => {
  return new EdgeError(`${resource} not found`, EdgeErrorCode.NOT_FOUND, 404);
};

export const createDatabaseError = (message: string, details?: Record<string, any>) => {
  return new EdgeError(message, EdgeErrorCode.DATABASE_ERROR, 500, details);
};

export const createExternalApiError = (message: string, details?: Record<string, any>) => {
  return new EdgeError(message, EdgeErrorCode.EXTERNAL_API_ERROR, 502, details);
};

export const createRateLimitError = (message: string = 'Rate limit exceeded') => {
  return new EdgeError(message, EdgeErrorCode.RATE_LIMIT_ERROR, 429);
};

export const createInternalServerError = (message: string = 'Internal server error') => {
  return new EdgeError(message, EdgeErrorCode.INTERNAL_SERVER_ERROR, 500);
};

// Handle errors in edge functions with consistent response format
export const handleEdgeError = (error: any): Response => {
  console.error('Edge function error:', error);

  // Handle EdgeError instances
  if (error instanceof EdgeError) {
    return new Response(JSON.stringify(error.toJSON()), {
      status: error.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle other known error types
  if (error.name === 'PostgrestError') {
    return new Response(JSON.stringify({
      error: {
        message: error.message || 'Database operation failed',
        code: EdgeErrorCode.DATABASE_ERROR,
        details: { code: error.code }
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle unexpected errors
  return new Response(JSON.stringify({
    error: {
      message: 'An unexpected error occurred',
      code: EdgeErrorCode.INTERNAL_SERVER_ERROR
    }
  }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
};

// Error handling middleware for edge functions
export const withErrorHandling = (handler: Function) => {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleEdgeError(error);
    }
  };
};
