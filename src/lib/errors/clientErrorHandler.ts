
import { toast } from 'sonner';
import { ErrorHandlerBase } from './ErrorHandlerBase';
import { AlloraError } from './errorTypes';

/**
 * Process a response from an edge function
 * 
 * @param {Response} response - The fetch Response object
 * @returns {Promise<any>} The processed data
 * @throws {Error} If the response is not OK
 */
export async function processEdgeResponse(response: Response): Promise<any> {
  // Check if response is OK (status in the range 200-299)
  if (!response.ok) {
    // Try to extract error details from JSON response
    try {
      const errorData = await response.json();
      
      // Handle structured error responses
      if (errorData && errorData.error) {
        const error = new Error(errorData.error);
        
        // Add additional error properties for proper handling
        if (errorData.code) (error as any).code = errorData.code;
        if (errorData.status) (error as any).status = errorData.status;
        if (errorData.requestId) (error as any).requestId = errorData.requestId;
        if (errorData.details) (error as any).details = errorData.details;
        
        throw error;
      }
      
      // If no structured error but response contains message
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      }
      
      // Fall back to generic message with status
      throw new Error(`Server Error: ${response.status} ${response.statusText}`);
    } catch (parseError) {
      // If JSON parsing fails, throw error with status code
      if (parseError instanceof Error && parseError.message !== 'invalid json response body') {
        throw parseError;
      }
      throw new Error(`Server Error: ${response.status} ${response.statusText}`);
    }
  }

  // For successful responses, try to extract data
  try {
    const data = await response.json();
    
    // Handle standard response format with data property
    if ('data' in data) {
      return data.data;
    }
    
    // Legacy format might return data directly
    return data;
  } catch (error) {
    // Handle case where response body is not valid JSON
    console.error('Error parsing response:', error);
    throw new Error('Invalid response format from server');
  }
}

interface EdgeErrorHandlerOptions {
  showToast?: boolean;
  fallbackMessage?: string;
  logToConsole?: boolean;
  errorCallback?: (error: any) => void;
  toastOptions?: Record<string, any>;
}

/**
 * Handle errors from edge functions with proper UI feedback
 * 
 * @param {any} error - The error object
 * @param {Object} options - Error handling options
 */
export function handleEdgeError(
  error: any,
  options: EdgeErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    fallbackMessage = 'An unexpected error occurred',
    logToConsole = true,
    errorCallback,
    toastOptions = {}
  } = options;
  
  // Normalize the error for consistent handling
  const normalizedError = ErrorHandlerBase.normalizeError(error);
  
  // Get user-friendly message
  const message = normalizedError.userMessage || 
                  normalizedError.message || 
                  (error?.message || fallbackMessage);
  
  // Show toast notification
  if (showToast) {
    toast.error(message, {
      description: normalizedError.requestId ? 
        `Request ID: ${normalizedError.requestId}` : undefined,
      ...toastOptions
    });
  }
  
  // Log to console
  if (logToConsole) {
    console.error('Edge function error:', {
      message: normalizedError.message,
      code: normalizedError.code,
      requestId: normalizedError.requestId,
      details: normalizedError.context
    });
  }
  
  // Call custom error handler if provided
  if (errorCallback) {
    errorCallback(error);
  }
}

interface EdgeFunctionOptions extends EdgeErrorHandlerOptions {
  transformResult?: (data: any) => any;
  silent?: boolean;
}

/**
 * Create a wrapped edge function with error handling
 * 
 * @template T Input arguments type
 * @template R Return type
 * @param {Function} fn - The edge function to wrap
 * @param {Object} options - Configuration options
 * @returns {Function} Wrapped function with error handling
 */
export function createEdgeFunction<T, R>(
  fn: (arg: T) => Promise<R>, 
  options: EdgeFunctionOptions = {}
): (arg: T) => Promise<R | null> {
  return async (arg: T): Promise<R | null> => {
    const { 
      transformResult, 
      silent = false,
      ...errorOptions
    } = options;
    
    try {
      // Call the original function
      const result = await fn(arg);
      
      // Transform result if transformer provided
      return transformResult ? transformResult(result) : result;
    } catch (error) {
      // Don't show UI notifications in silent mode
      if (!silent) {
        handleEdgeError(error, errorOptions);
      }
      
      // Still log error in console even in silent mode
      if (silent && errorOptions.logToConsole !== false) {
        console.error('Silent edge function error:', error);
      }
      
      return null;
    }
  };
}

export default {
  processEdgeResponse,
  handleEdgeError,
  createEdgeFunction
};
