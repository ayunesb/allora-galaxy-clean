import {
  AlloraError,
  DatabaseError,
  AuthError,
  PermissionError,
  NotFoundError,
} from "./errorTypes";
import { ErrorHandlerBase } from "./ErrorHandlerBase";

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
    } = {},
  ): AlloraError {
    const {
      context = {},
      showNotification = true,
      logToSystem = true,
      tenantId = "system",
    } = options;

    // Default to database error
    let alloraError: AlloraError = new DatabaseError(
      error?.message || "Database operation failed",
    );

    // Check for specific Supabase error patterns
    if (error?.code) {
      // Authentication errors
      if (
        error.code === "auth/invalid-email" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        alloraError = new AuthError(error.message);
      }

      // Permission errors
      else if (
        error.code === "PGRST301" ||
        error.message?.includes("permission denied") ||
        error.message?.includes("violates row-level security")
      ) {
        alloraError = new PermissionError(
          "You do not have permission to perform this action",
        );
      }

      // Not found errors
      else if (error.code === "PGRST404") {
        alloraError = new NotFoundError("The requested resource was not found");
      }
    }

    // Handle the error through the central handler
    this.handleError(alloraError, {
      showNotification,
      logToSystem,
      tenantId,
      module: "database",
    });

    return alloraError;
  }
}

// Remove unused parameter 'context'
export function handleSupabaseError(error: unknown) {
  return SupabaseErrorHandler.handleSupabaseError(error);
}
