
/**
 * Central error handler module for Allora OS
 * Provides standardized error handling across the application
 * 
 * @module ErrorHandler
 */

import { AlloraError } from './errorTypes';
import { ErrorHandlerBase } from './ErrorHandlerBase';
import { SupabaseErrorHandler, handleSupabaseError } from './SupabaseErrorHandler';
import { EdgeFunctionErrorHandler, handleEdgeFunctionError } from './EdgeFunctionErrorHandler';

/**
 * Centralized error handler for the application
 * This class extends base functionality and integrates specialized handlers
 * 
 * @class ErrorHandler
 * @extends ErrorHandlerBase
 */
export class ErrorHandler extends ErrorHandlerBase {
  /**
   * Handler for Supabase-specific errors
   */
  static readonly supabase = SupabaseErrorHandler;
  
  /**
   * Handler for Edge Function errors
   */
  static readonly edgeFunction = EdgeFunctionErrorHandler;
}

/**
 * Utility function to handle any type of error
 * 
 * @param {unknown} error - The error to handle
 * @param {object} [options={}] - Options for error handling
 * @returns {Promise<AlloraError>} A standardized AlloraError object
 */
export function handleError(
  error: unknown, 
  options: Parameters<typeof ErrorHandler.handleError>[1] = {}
): Promise<AlloraError> {
  return ErrorHandler.handleError(error, options);
}

// Re-export specialized handlers for convenience
export { handleSupabaseError, handleEdgeFunctionError };
