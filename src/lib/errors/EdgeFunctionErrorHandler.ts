
import { AlloraError, ApiError, PermissionError, NotFoundError, ValidationError } from './errorTypes';
import { ErrorHandlerBase } from './ErrorHandlerBase';

/**
 * Error handler for Edge Function specific errors
 */
export class EdgeFunctionErrorHandler extends ErrorHandlerBase {
  /**
   * Handle errors from edge functions
   */
  static handleEdgeFunctionError(
    error: any,
    options: { 
      context?: Record<string, any>; 
      showNotification?: boolean; 
      logToSystem?: boolean;
      tenantId?: string;
      functionName?: string;
    } = {}
  ): AlloraError {
    const { 
      context = {}, 
      showNotification = true, 
      logToSystem = true, 
      tenantId = 'system',
      functionName = 'unknown'
    } = options;
    
    // Determine error type
    let alloraError: AlloraError;
    
    if (error?.status === 401 || error?.status === 403) {
      alloraError = new PermissionError({
        message: error.message || 'Permission denied in edge function',
        context: { edgeError: error, functionName, ...context },
        userMessage: 'You do not have permission to perform this action.'
      });
    } else if (error?.status === 404) {
      alloraError = new NotFoundError({
        message: error.message || 'Resource not found in edge function',
        context: { edgeError: error, functionName, ...context },
        userMessage: 'The requested resource was not found.'
      });
    } else if (error?.status === 400) {
      alloraError = new ValidationError({
        message: error.message || 'Invalid parameters for edge function',
        context: { edgeError: error, functionName, ...context },
        userMessage: 'There was a problem with the data sent to the server.'
      });
    } else {
      alloraError = new ApiError({
        message: error?.message || `Error in edge function: ${functionName}`,
        status: error?.status || 500,
        context: { edgeError: error, functionName, ...context },
        userMessage: 'There was a problem communicating with the server.',
        source: 'edge'
      });
    }
    
    // Handle the error through the central handler
    this.handleError(alloraError, {
      showNotification,
      logToSystem,
      tenantId,
      module: 'system'
    });
    
    return alloraError;
  }
}

// Export convenience function
export function handleEdgeFunctionError(
  error: any, 
  options: Parameters<typeof EdgeFunctionErrorHandler.handleEdgeFunctionError>[1] = {}
): AlloraError {
  return EdgeFunctionErrorHandler.handleEdgeFunctionError(error, options);
}
