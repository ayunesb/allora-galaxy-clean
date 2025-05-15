import { AlloraError } from './errorTypes';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { notifyError, notifyWarning } from '@/lib/notifications/toast';

/**
 * Base Error Handler with core functionality
 */
export class ErrorHandlerBase {
  /**
   * Process an error through the centralized error handling system
   */
  static async handleError(
    error: unknown, 
    options: {
      context?: Record<string, any>;
      showNotification?: boolean;
      logToSystem?: boolean;
      tenantId?: string;
      module?: string;
      silent?: boolean;
      rethrow?: boolean;
    } = {}
  ): Promise<AlloraError> {
    const {
      context = {},
      showNotification = true,
      logToSystem = true,
      tenantId = 'system',
      module = 'system',
      silent = false,
      rethrow = false
    } = options;
    
    // Convert unknown error to AlloraError
    const alloraError = this.normalizeError(error, context);
    
    // Add additional context
    const enhancedContext = {
      ...alloraError.context,
      ...context,
      timestamp: alloraError.timestamp
    };
    
    // Log to console (unless silent)
    if (!silent) {
      console.error(`[${alloraError.code}]`, alloraError.message, {
        errorType: alloraError.constructor.name,
        ...enhancedContext
      });
    }
    
    // Log to system logs
    if (logToSystem) {
      try {
        await logSystemEvent(
          module as any,
          'error',
          {
            description: alloraError.message,
            error_code: alloraError.code,
            error_type: alloraError.constructor.name,
            status: alloraError.status,
            request_id: alloraError.requestId,
            ...enhancedContext
          },
          tenantId
        );
      } catch (logError) {
        // Don't let logging failures cascade
        console.error('Failed to log error to system:', logError);
      }
    }
    
    // Show notification
    if (showNotification && !silent) {
      this.showErrorNotification(alloraError);
    }
    
    // Rethrow if needed
    if (rethrow) {
      throw alloraError;
    }
    
    return alloraError;
  }

  /**
   * Convert any error type to an AlloraError
   */
  static normalizeError(error: unknown, context: Record<string, any> = {}): AlloraError {
    // Already an AlloraError
    if (error instanceof AlloraError) {
      // Add additional context
      error.context = { ...error.context, ...context };
      return error;
    }
    
    // Error instance but not AlloraError
    if (error instanceof Error) {
      // Extract properties from Error object if they exist
      const errorObj = error as any;
      const status = errorObj.status || errorObj.statusCode;
      const code = errorObj.code || errorObj.errorCode;
      const requestId = errorObj.requestId || errorObj.request_id;
      
      // Check for specific error patterns to categorize
      const errorString = error.toString().toLowerCase();
      
      // Edge function error response
      if (errorObj.success === false && errorObj.error && errorObj.timestamp) {
        return new AlloraError({
          message: errorObj.error,
          code: code || 'EDGE_ERROR',
          severity: 'medium',
          context: { 
            details: errorObj.details,
            originalError: error,
            ...context 
          },
          userMessage: errorObj.userMessage || errorObj.error,
          source: 'edge',
          status: status || 500,
          requestId: requestId
        });
      }
      
      // Network error patterns
      if (
        errorString.includes('network') ||
        errorString.includes('fetch') ||
        errorString.includes('connection') ||
        errorString.includes('timeout') ||
        error.name === 'AbortError'
      ) {
        return new AlloraError({
          message: error.message,
          code: 'NETWORK_ERROR',
          severity: 'medium',
          context: { originalError: error, ...context },
          userMessage: 'Connection problem. Please check your internet connection.',
          source: 'client',
          retry: true,
          status: status || 503
        });
      }
      
      // Authentication error patterns
      if (
        errorString.includes('auth') ||
        errorString.includes('unauthorized') ||
        errorString.includes('not logged in') ||
        errorString.includes('jwt') ||
        errorString.includes('token')
      ) {
        return new AlloraError({
          message: error.message,
          code: 'AUTH_ERROR',
          severity: 'high',
          context: { originalError: error, ...context },
          userMessage: 'Your session may have expired. Please sign in again.',
          source: 'client',
          retry: false,
          status: status || 401
        });
      }
      
      // Not found patterns
      if (
        errorString.includes('not found') ||
        errorString.includes('404') ||
        status === 404
      ) {
        return new AlloraError({
          message: error.message,
          code: 'NOT_FOUND',
          severity: 'medium', 
          context: { originalError: error, ...context },
          userMessage: 'The requested resource could not be found.',
          source: error.name?.includes('Api') ? 'server' : 'client',
          status: 404
        });
      }
      
      // Otherwise, create a generic AlloraError
      return new AlloraError({
        message: error.message,
        code: code || 'UNKNOWN_ERROR',
        context: { originalError: error, stack: error.stack, ...context },
        userMessage: 'An unexpected error occurred. Please try again later.',
        status: status,
        requestId: requestId
      });
    }
    
    // Handle strings
    if (typeof error === 'string') {
      return new AlloraError({
        message: error,
        context,
        userMessage: error
      });
    }
    
    // Handle edge error response objects
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      if (errorObj.success === false && errorObj.error) {
        return new AlloraError({
          message: errorObj.error,
          code: errorObj.code || 'EDGE_ERROR',
          context: { details: errorObj.details, ...context },
          userMessage: errorObj.error,
          source: 'edge',
          status: errorObj.status || 500,
          requestId: errorObj.requestId
        });
      }
    }
    
    // Handle other types (objects, etc.)
    return new AlloraError({
      message: 'Unknown error occurred',
      context: { originalError: error, ...context },
      userMessage: 'An unexpected error occurred. Please try again later.'
    });
  }

  /**
   * Show an error notification to the user
   */
  static showErrorNotification(error: AlloraError): void {
    const isCritical = error.severity === 'critical' || error.severity === 'high';
    const message = error.userMessage || error.message;
    
    if (isCritical) {
      notifyError(message);
    } else {
      notifyWarning(message);
    }
  }
  
  /**
   * Serialize an error for transmission
   */
  static serializeError(error: unknown): Record<string, any> {
    if (error instanceof AlloraError) {
      return error.toJSON();
    }
    
    // Convert to AlloraError first, then serialize
    const alloraError = this.normalizeError(error);
    return alloraError.toJSON();
  }
  
  /**
   * Deserialize an error from transmission
   */
  static deserializeError(serialized: Record<string, any>): AlloraError {
    return AlloraError.fromJSON(serialized);
  }
}
