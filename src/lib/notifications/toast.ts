import { toast as sonnerToast } from "sonner";

/**
 * Enhanced toast notification system that extends Sonner's toast functionality
 * Provides a unified API for displaying various types of notifications
 *
 * @example
 * ```typescript
 * // Basic usage
 * toast("Message sent")
 *
 * // With title and description
 * toast({
 *   title: "Profile updated",
 *   description: "Your changes have been saved"
 * })
 *
 * // Type-specific notifications
 * toast.success("Payment processed successfully")
 * toast.error("Failed to connect to server")
 * toast.warning("Your session will expire soon")
 * toast.info("New features are available")
 * toast.loading("Processing payment...")
 *
 * // With promise for async operations
 * toast.promise(
 *   saveData(),
 *   {
 *     loading: "Saving changes...",
 *     success: "Changes saved successfully",
 *     error: "Failed to save changes"
 *   }
 * )
 * ```
 */
export const toast = Object.assign(
  /**
   * Display a toast notification with the given message or title/description
   *
   * @param message - The notification message as string or object with title/description
   * @param options - Additional configuration options
   * @returns The toast ID that can be used for dismissing
   */
  (
    message: string | { title: string; description?: string },
    options?: ToastOptions,
  ) => {
    if (typeof message === "string") {
      return sonnerToast(message, options);
    } else {
      return sonnerToast(message.title, {
        description: message.description,
        ...options,
      });
    }
  },
  {
    /**
     * Display a success toast notification
     *
     * @param message - The notification message as string or object with title/description
     * @param options - Additional configuration options
     * @returns The toast ID that can be used for dismissing
     */
    success: (
      message: string | { title: string; description?: string },
      options?: ToastOptions,
    ) => {
      if (typeof message === "string") {
        return sonnerToast.success(message, options);
      } else {
        return sonnerToast.success(message.title, {
          description: message.description,
          ...options,
        });
      }
    },

    /**
     * Display an error toast notification
     *
     * @param message - The notification message as string or object with title/description
     * @param options - Additional configuration options
     * @returns The toast ID that can be used for dismissing
     */
    error: (
      message: string | { title: string; description?: string },
      options?: ToastOptions,
    ) => {
      if (typeof message === "string") {
        return sonnerToast.error(message, options);
      } else {
        return sonnerToast.error(message.title, {
          description: message.description,
          ...options,
        });
      }
    },

    /**
     * Display a warning toast notification
     *
     * @param message - The notification message as string or object with title/description
     * @param options - Additional configuration options
     * @returns The toast ID that can be used for dismissing
     */
    warning: (
      message: string | { title: string; description?: string },
      options?: ToastOptions,
    ) => {
      if (typeof message === "string") {
        return sonnerToast.warning(message, options);
      } else {
        return sonnerToast.warning(message.title, {
          description: message.description,
          ...options,
        });
      }
    },

    /**
     * Display an information toast notification
     *
     * @param message - The notification message as string or object with title/description
     * @param options - Additional configuration options
     * @returns The toast ID that can be used for dismissing
     */
    info: (
      message: string | { title: string; description?: string },
      options?: ToastOptions,
    ) => {
      if (typeof message === "string") {
        return sonnerToast.info(message, options);
      } else {
        return sonnerToast.info(message.title, {
          description: message.description,
          ...options,
        });
      }
    },

    /**
     * Display a loading toast notification
     *
     * @param message - The notification message as string or object with title/description
     * @param options - Additional configuration options
     * @returns The toast ID that can be used for dismissing
     */
    loading: (
      message: string | { title: string; description?: string },
      options?: ToastOptions,
    ) => {
      if (typeof message === "string") {
        return sonnerToast.loading(message, options);
      } else {
        return sonnerToast.loading(message.title, {
          description: message.description,
          ...options,
        });
      }
    },

    /**
     * Dismiss a specific toast or all toasts
     *
     * @param toastId - Optional ID of the toast to dismiss, dismisses all if not provided
     */
    dismiss: sonnerToast.dismiss,

    /**
     * Display a custom toast component
     */
    custom: sonnerToast.custom,

    /**
     * Handle promise with loading, success, and error states
     *
     * @param promise - The promise to track
     * @param messages - Object containing loading, success, and error messages
     * @param options - Additional configuration options
     * @returns The original promise (for chaining)
     */
    promise: sonnerToast.promise,
  },
);

export const notify = (msg: any) => console.log("[notify]", msg);
export const notifyError = (msg: any) => console.error("[notifyError]", msg);
export const notifyWarning = (msg: any) => console.warn("[notifyWarning]", msg);
export const notifyInfo = (msg: any) => console.info("[notifyInfo]", msg);
export const notifySuccess = (msg: any) => console.log("[notifySuccess]", msg);

export function notifyPromise<T>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string },
): Promise<T> {
  console.log(`[promise loading]: ${messages.loading}`);
  return promise
    .then((result) => {
      console.log(`[promise success]: ${messages.success}`);
      return result;
    })
    .catch((err) => {
      console.error(`[promise error]: ${messages.error}`);
      throw err;
    });
}

// Add this stub if not present
export function useToast() {
  // Simple stub, replace with actual implementation if needed
  function notify(msg: string | { title: string; description?: string }) {
    if (typeof msg === "string") {
      // Show toast with just a message
      console.log(`[toast]: ${msg}`);
    } else {
      // Show toast with title and optional description
      console.log(
        `[toast]: ${msg.title}`,
        msg.description ? `- ${msg.description}` : "",
      );
    }
  }
  function notifyError(msg: string | { title: string; description?: string }) {
    if (typeof msg === "string") {
      // Show error toast with just a message
      console.error(`[toast error]: ${msg}`);
    } else {
      // Show error toast with title and optional description
      console.error(
        `[toast error]: ${msg.title}`,
        msg.description ? `- ${msg.description}` : "",
      );
    }
  }
  function notifySuccess(
    msg: string | { title: string; description?: string },
  ) {
    if (typeof msg === "string") {
      // Show success toast with just a message
      console.log(`[toast success]: ${msg}`);
    } else {
      // Show success toast with title and optional description
      console.log(
        `[toast success]: ${msg.title}`,
        msg.description ? `- ${msg.description}` : "",
      );
    }
  }
  return {
    notify,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifySuccess,
  };
}

export function notifyAndLog(message: string) {
  console.log(`[notify]: ${message}`);
  // You can add additional logging logic here if needed
}

// Add ToastOptions type if missing
type ToastOptions = {
  duration?: number;
  variant?: "success" | "error" | "info";
  title?: string;
  description?: string;
};

export default toast;
