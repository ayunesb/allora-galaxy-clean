
import { AlloraError, DatabaseError, AuthError, PermissionError, NotFoundError } from './errorTypes';
import { ErrorHandlerBase } from './ErrorHandlerBase';

/**
 * Error handler for Supabase-specific errors
 */
export class SupabaseErrorHandler extends ErrorHandlerBase {
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
}

// Export convenience function
export function handleSupabaseError(
  error: any, 
  options: Parameters<typeof SupabaseErrorHandler.handleSupabaseError>[1] = {}
): AlloraError {
  return SupabaseErrorHandler.handleSupabaseError(error, options);
}
