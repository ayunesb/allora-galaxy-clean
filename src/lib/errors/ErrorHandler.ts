import { 
  AlloraError, 
  ApiError, 
  AuthError, 
  DatabaseError, 
  NetworkError, 
  NotFoundError, 
  PermissionError, 
  ValidationError, 
  ExternalServiceError,
  TimeoutError
} from './errorTypes';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { notifyError, notifyWarning } from '@/components/ui/BetterToast';

/**
 * Centralized error handler for the application
 */
export class ErrorHandler {
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
      errorType: alloraError.constructor.name,
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
      // Check for specific error patterns to categorize
      const errorString = error.toString().toLowerCase();
      
      // Network error patterns
      if (
        errorString.includes('network') ||
        errorString.includes('fetch') ||
        errorString.includes('connection') ||
        errorString.includes('timeout') ||
        error.name === 'AbortError'
      ) {
        return new NetworkError({
          message: error.message,
          context: { originalError: error, ...context },
          userMessage: 'Connection problem. Please check your internet connection.'
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
        return new AuthError({
          message: error.message,
          context: { originalError: error, ...context },
          userMessage: 'Your session may have expired. Please sign in again.'
        });
      }
      
      // Otherwise, create a generic AlloraError
      return new AlloraError({
        message: error.message,
        context: { originalError: error, ...context },
        userMessage: 'An unexpected error occurred. Please try again later.'
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
    const isCritical = error.severity === 'critical';
    const message = error.userMessage || error.message;
    
    if (isCritical) {
      notifyError('Error', message);
    } else {
      notifyWarning('Warning', message);
    }
  }

  /**
   * Handle a specific API error from Supabase
   */
  static handleSupabaseError(
    error: any, 
    options: { 
      context?: Record<string, any>; 
      showNotification?: boolean; 
      logToSystem?: boolean;
      tenantId?: string;
    } = {}
  ): AlloraError {
    const { context = {}, showNotification = true, logToSystem = true, tenantId = 'system' } = options;
    
    // Default to database error
    let alloraError: AlloraError = new DatabaseError({
      message: error?.message || 'Database operation failed',
      context: { supabaseError: error, ...context },
      userMessage: 'We encountered an issue with the database. Please try again later.'
    });
    
    // Check for specific Supabase error patterns
    if (error?.code) {
      // Authentication errors
      if (error.code === 'auth/invalid-email' || 
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password') {
        alloraError = new AuthError({
          message: error.message,
          code: error.code,
          context: { supabaseError: error, ...context },
          userMessage: 'Invalid login credentials. Please check your email and password.'
        });
      }
      
      // Permission errors
      else if (error.code === 'PGRST301' || 
              error.message?.includes('permission denied') ||
              error.message?.includes('violates row-level security')) {
        alloraError = new PermissionError({
          message: 'You do not have permission to perform this action',
          code: error.code,
          context: { supabaseError: error, ...context },
          userMessage: 'You do not have permission to perform this action.'
        });
      }
      
      // Not found errors
      else if (error.code === 'PGRST404') {
        alloraError = new NotFoundError({
          message: 'The requested resource was not found',
          code: error.code,
          context: { supabaseError: error, ...context },
          userMessage: 'The requested item was not found.'
        });
      }
    }
    
    // Handle the error through the central handler
    this.handleError(alloraError, {
      showNotification,
      logToSystem,
      tenantId,
      module: 'database'
    });
    
    return alloraError;
  }

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

// Export utility functions for convenience
export function handleError(
  error: unknown, 
  options: Parameters<typeof ErrorHandler.handleError>[1] = {}
): Promise<AlloraError> {
  return ErrorHandler.handleError(error, options);
}

export function handleSupabaseError(
  error: any, 
  options: Parameters<typeof ErrorHandler.handleSupabaseError>[1] = {}
): AlloraError {
  return ErrorHandler.handleSupabaseError(error, options);
}

export function handleEdgeFunctionError(
  error: any, 
  options: Parameters<typeof ErrorHandler.handleEdgeFunctionError>[1] = {}
): AlloraError {
  return ErrorHandler.handleEdgeFunctionError(error, options);
}
