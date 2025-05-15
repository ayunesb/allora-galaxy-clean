
/**
 * Central error handler module for the application
 * Provides standardized error handling across the application
 * 
 * @module ErrorHandler
 */

import { AlloraError } from './errorTypes';
import { ErrorHandlerBase } from './ErrorHandlerBase';
import { SupabaseErrorHandler, handleSupabaseError } from './SupabaseErrorHandler';
import { EdgeFunctionErrorHandler, handleEdgeFunctionError } from './EdgeFunctionErrorHandler';

/**
 * Options for error handling
 */
export interface ErrorHandlerOptions {
  /** Whether to show a toast notification */
  showNotification?: boolean;
  /** Whether to log the error to the system logs */
  logToSystem?: boolean;
  /** The tenant ID (for multi-tenant systems) */
  tenantId?: string;
  /** Custom notification title */
  notificationTitle?: string;
  /** Custom user-facing error message */
  userMessage?: string;
  /** Module where the error occurred */
  module?: string;
  /** Additional context information */
  context?: Record<string, any>;
}

/**
 * Centralized error handler for the application
 * This class extends base functionality and integrates specialized handlers
 * 
 * @class ErrorHandler
 * @extends ErrorHandlerBase
 * @example
 * ```typescript
 * // Handle any type of error with default options
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const standardError = await ErrorHandler.handleError(error);
 *   console.log(standardError.severity); // Access standardized properties
 * }
 * 
 * // With custom options
 * try {
 *   await saveData();
 * } catch (error) {
 *   const standardError = await ErrorHandler.handleError(error, {
 *     showNotification: true,
 *     userMessage: "Failed to save your data. Please try again.",
 *     module: "dataEditor",
 *     context: { recordId: "123", operation: "update" }
 *   });
 * }
 * ```
 */
export class ErrorHandler extends ErrorHandlerBase {
  /**
   * Handler for Supabase-specific errors
   * Use for errors from Supabase client operations
   */
  static readonly supabase = SupabaseErrorHandler;
  
  /**
   * Handler for Edge Function errors
   * Use for errors from Supabase Edge Function invocations
   */
  static readonly edgeFunction = EdgeFunctionErrorHandler;
}

/**
 * Utility function to handle any type of error
 * Converts raw errors to standardized AlloraError format
 * 
 * @param {unknown} error - The error to handle
 * @param {ErrorHandlerOptions} [options={}] - Options for error handling
 * @returns {Promise<AlloraError>} A standardized AlloraError object
 * @example
 * ```typescript
 * // Basic usage
 * try {
 *   await fetchData();
 * } catch (error) {
 *   const standardError = await handleError(error);
 *   console.log(standardError.code); // Access standardized error code
 * }
 * 
 * // With notification and logging
 * try {
 *   await submitForm();
 * } catch (error) {
 *   const standardError = await handleError(error, {
 *     showNotification: true,
 *     logToSystem: true,
 *     module: "form-submission"
 *   });
 * }
 * ```
 */
export function handleError(
  error: unknown, 
  options: ErrorHandlerOptions = {}
): Promise<AlloraError> {
  return ErrorHandler.handleError(error, options);
}

// Re-export specialized handlers for convenience
export { handleSupabaseError, handleEdgeFunctionError };
