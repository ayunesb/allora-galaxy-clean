import { toast } from "sonner";

/**
 * Process a response from an edge function
 * Handles standard response format and errors
 */
export async function processEdgeResponse(response: Response): Promise<any> {
  // Check if the response is valid
  if (!response.ok) {
    let errorData: any;

    try {
      // Try to parse error response
      errorData = await response.json();

      // If response has detailed error format
      if (errorData && !errorData.success) {
        // Create error with details from response
        const error: any = new Error(errorData.error || "Unknown error");
        error.status = errorData.status || response.status;
        error.code = errorData.code;
        error.details = errorData.details;
        error.requestId = errorData.requestId;
        error.timestamp = errorData.timestamp;
        throw error;
      }
    } catch (parseError) {
      // If response cannot be parsed as JSON, throw a generic error
      throw new Error(
        `Server Error: ${response.status} ${response.statusText}`,
      );
    }

    // Fallback error if we get here
    throw new Error(
      errorData?.message || `Request failed with status ${response.status}`,
    );
  }

  // Parse successful response
  const data = await response.json();

  // Our standard edge function response format
  if (data && typeof data.success === "boolean" && data.success) {
    return data.data;
  }

  // Non-standard response format, return as is
  return data;
}

/**
 * Handle edge function errors with standard display and logging
 */
export function handleEdgeError(
  error: any,
  options: {
    fallbackMessage?: string;
    showToast?: boolean;
    logToConsole?: boolean;
    errorCallback?: (error: any) => void;
  } = {},
) {
  const {
    fallbackMessage = "An unexpected error occurred",
    showToast = true,
    logToConsole = true,
    errorCallback,
  } = options;

  // Get error message
  const errorMessage = error?.message || error?.error || fallbackMessage;

  // Log to console
  if (logToConsole) {
    console.error("Edge function error:", error);
  }

  // Show toast notification
  if (showToast) {
    toast.error(errorMessage, {
      description: error?.details
        ? `Reference ID: ${error.requestId || "unknown"}`
        : undefined,
      duration: 5000,
    });
  }

  // Call error callback if provided
  if (errorCallback && typeof errorCallback === "function") {
    errorCallback(error);
  }

  return error;
}

/**
 * Create a wrapped edge function with error handling
 */
export function createEdgeFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    fallbackMessage?: string;
    showToast?: boolean;
    logToConsole?: boolean;
  } = {},
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleEdgeError(error, options);
      return null;
    }
  };
}

/**
 * Handle errors from client-side code
 */
export function handleClientError(error: unknown, context?: Record<string, unknown>) {
  // Log the error to the console
  console.error("Client Error:", error, context);

  // Show a toast notification with the error message
  toast.error(
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: string }).message)
      : "Unknown error",
  );
}
