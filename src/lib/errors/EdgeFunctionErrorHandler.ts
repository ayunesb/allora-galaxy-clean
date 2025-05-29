import {
  AlloraError,
  ApiError,
  PermissionError,
  NotFoundError,
  ValidationError,
} from "./errorTypes";
import { ErrorHandlerBase } from "./ErrorHandlerBase";

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
    } = {},
  ): AlloraError {
    const {
      context = {},
      showNotification = true,
      logToSystem = true,
      tenantId = "system",
      functionName = "unknown",
    } = options;

    // Determine error type
    let alloraError: AlloraError;

    if (error?.status === 401 || error?.status === 403) {
      alloraError = new PermissionError(
        error.message || "Permission denied in edge function",
      );
    } else if (error?.status === 404) {
      alloraError = new NotFoundError(
        error.message || "Resource not found in edge function",
      );
    } else if (error?.status === 400) {
      // Replace object argument with string for ValidationError
      alloraError = new ValidationError(
        error.message || "Invalid parameters for edge function",
      );
    } else {
      // Replace object argument with string for ApiError
      alloraError = new ApiError(
        error?.message || `Error in edge function: ${functionName}`,
      );
    }

    // Handle the error through the central handler
    this.handleError(alloraError, {
      showNotification,
      logToSystem,
      tenantId,
      module: "system",
    });

    return alloraError;
  }
}

// Export convenience function
export function handleEdgeFunctionError(
  error: any,
  options: Parameters<
    typeof EdgeFunctionErrorHandler.handleEdgeFunctionError
  >[1] = {},
): AlloraError {
  return EdgeFunctionErrorHandler.handleEdgeFunctionError(error, options);
}
