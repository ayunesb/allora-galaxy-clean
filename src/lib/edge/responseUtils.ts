
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
  const executionTime = startTime ? Date.now() - startTime : undefined;
  
  return {
    data,
    meta: {
      executionTime,
      requestId,
      pagination
    }
  };
}
