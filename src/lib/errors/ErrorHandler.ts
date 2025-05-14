
import { AlloraError } from './errorTypes';
import { ErrorHandlerBase } from './ErrorHandlerBase';
import { SupabaseErrorHandler, handleSupabaseError } from './SupabaseErrorHandler';
import { EdgeFunctionErrorHandler, handleEdgeFunctionError } from './EdgeFunctionErrorHandler';

/**
 * Centralized error handler for the application
 * This class extends base functionality and integrates specialized handlers
 */
export class ErrorHandler extends ErrorHandlerBase {
  static readonly supabase = SupabaseErrorHandler;
  static readonly edgeFunction = EdgeFunctionErrorHandler;
}

// Export utility functions for convenience
export function handleError(
  error: unknown, 
  options: Parameters<typeof ErrorHandler.handleError>[1] = {}
): Promise<AlloraError> {
  return ErrorHandler.handleError(error, options);
}

// Re-export specialized handlers
export { handleSupabaseError, handleEdgeFunctionError };
