
/**
 * Client-side error handler for edge function responses
 */
import { toast } from "sonner";
import { handleError } from "./ErrorHandler";

export interface EdgeErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  requestId?: string;
  timestamp: string;
  status: number;
}

export interface EdgeSuccessResponse<T = any> {
  success: true;
  data: T;
  requestId?: string;
  timestamp: string;
}

export type EdgeResponse<T = any> = EdgeSuccessResponse<T> | EdgeErrorResponse;

/**
 * Process an edge function response
 * @param response The response from the edge function
 * @returns The data from the response if successful
 * @throws An error with details from the response if unsuccessful
 */
export async function processEdgeResponse<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: EdgeErrorResponse;
    
    try {
      errorData = await response.json() as EdgeErrorResponse;
    } catch (e) {
      // If we can't parse the error, create a generic one
      throw new Error(`Server Error: ${response.status} ${response.statusText}`);
    }
    
    const error = new Error(errorData.error || 'Unknown error');
    // Attach additional properties
    Object.assign(error, {
      statusCode: errorData.status || response.status,
      code: errorData.code || 'UNKNOWN_ERROR',
      details: errorData.details,
      requestId: errorData.requestId,
      timestamp: errorData.timestamp
    });
    
    throw error;
  }
  
  const data = await response.json();
  return (data.success === true ? data.data : data) as T;
}

/**
 * Handle edge function errors in a standardized way
 * @param error The error to handle
 * @param options Options for handling the error
 * @returns true if the error was handled, false otherwise
 */
export function handleEdgeError(error: any, options: {
  showToast?: boolean;
  fallbackMessage?: string;
  logToConsole?: boolean;
  retryHandler?: () => void;
  errorCallback?: (e: any) => void;
} = {}): boolean {
  const {
    showToast = true,
    fallbackMessage = 'An error occurred while processing your request',
    logToConsole = true,
    retryHandler,
    errorCallback
  } = options;
  
  if (logToConsole) {
    console.error('Edge function error:', error);
  }
  
  const message = error.message || fallbackMessage;
  const requestId = error.requestId || 'unknown';
  
  if (showToast) {
    toast.error(message, {
      description: `Request ID: ${requestId}`,
      action: retryHandler ? {
        label: 'Retry',
        onClick: retryHandler
      } : undefined
    });
  }
  
  // Call application error handler for tracking
  handleError(error, { 
    showNotification: false, // We already showed a toast
    context: { 
      requestId,
      source: 'edge'
    }
  }).catch(e => console.error('Failed to log edge error:', e));
  
  if (errorCallback) {
    errorCallback(error);
  }
  
  return true;
}

/**
 * Create a wrapped function that handles edge function calls with proper error handling
 */
export function createEdgeFunction<T, R>(
  fn: (data: T) => Promise<R>,
  options: {
    showToast?: boolean;
    fallbackMessage?: string;
    onError?: (e: any) => void;
  } = {}
) {
  return async (data: T): Promise<R | null> => {
    try {
      return await fn(data);
    } catch (error) {
      handleEdgeError(error, {
        showToast: options.showToast ?? true,
        fallbackMessage: options.fallbackMessage || 'Failed to process request',
        errorCallback: options.onError
      });
      return null;
    }
  };
}
