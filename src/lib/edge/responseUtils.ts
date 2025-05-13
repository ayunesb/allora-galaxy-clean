/**
 * Standard response format for edge functions
 */
export interface EdgeResponse<T = any> {
  data?: T;
  meta?: {
    executionTime?: number;
    requestId?: string;
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
    };
  };
}

/**
 * Options for formatting edge function responses
 */
export interface ResponseFormatOptions {
  startTime?: number;
  requestId?: string;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

/**
 * Formats success responses from edge functions in a standardized way
 */
export function formatEdgeResponse<T>(
  data: T, 
  options: ResponseFormatOptions = {}
): EdgeResponse<T> {
  const { startTime, requestId, pagination } = options;
  
  // Calculate execution time if startTime was provided
  const executionTime = startTime ? (performance.now() - startTime) / 1000 : undefined;
  
  return {
    data,
    meta: {
      executionTime,
      requestId,
      pagination
    }
  };
}

/**
 * Process edge function response to normalize data format
 */
export function processEdgeResponse<T>(response: any): T | null {
  if (!response) return null;
  
  // If response follows the standard format, return the data property
  if (response.data !== undefined) {
    return response.data as T;
  }
  
  // Otherwise return the whole response
  return response as T;
}

/**
 * Handle edge function errors in a standardized way
 */
export function handleEdgeResponseError(error: any): {
  message: string;
  details?: any;
} {
  if (!error) return { message: 'Unknown error' };
  
  // Handle standardized error format
  if (error.error && typeof error.error === 'string') {
    return {
      message: error.error,
      details: error.details
    };
  }
  
  // Handle error message object
  if (error.message) {
    return {
      message: error.message,
      details: error
    };
  }
  
  // Handle string error
  if (typeof error === 'string') {
    return { message: error };
  }
  
  // Default fallback
  return {
    message: 'An unknown error occurred',
    details: error
  };
}
