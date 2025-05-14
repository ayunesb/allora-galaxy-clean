import { toast as sonnerToast } from "sonner";
import type { ToastT } from "sonner";

export type ToastActionElement = React.ReactElement<any, any>;

// Type for our simplified toast options
export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
  id?: string;
  onDismiss?: () => void;
  action?: ToastActionElement;
}

// Function to ensure toast props compatibility with both our format and Sonner format
const ensureToastPropsCompatibility = (options: ToastOptions | ToastT): ToastT => {
  // If it already has an id property (and thus fits the ToastT type), assume it's a valid Sonner toast prop
  if ('id' in options) {
    return options as ToastT;
  }
  
  // Otherwise convert our format to Sonner format
  const { variant, ...rest } = options as ToastOptions;
  const result: ToastT = {
    id: rest.id || String(Date.now()),
    ...rest
  };
  
  return result;
};

/**
 * Enhanced toast interface that combines Sonner functionality with UI consistency
 */
export const toast = {
  // Basic toast function that supports both our options format and Sonner's
  toast: (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      return sonnerToast(options);
    }
    return sonnerToast(ensureToastPropsCompatibility(options));
  },
  
  /**
   * Display a success toast notification
   */
  success: (message: string, options?: ToastOptions | ToastT) => {
    if (typeof options === 'object') {
      const sonnerOptions = ensureToastPropsCompatibility(options);
      return sonnerToast.success(message, sonnerOptions);
    }
    return sonnerToast.success(message);
  },
  
  /**
   * Display an error toast notification
   */
  error: (message: string, options?: ToastOptions | ToastT) => {
    if (typeof options === 'object') {
      const sonnerOptions = ensureToastPropsCompatibility(options);
      return sonnerToast.error(message, sonnerOptions);
    }
    return sonnerToast.error(message);
  },
  
  /**
   * Display an info toast notification
   */
  info: (message: string, options?: ToastOptions | ToastT) => {
    if (typeof options === 'object') {
      const sonnerOptions = ensureToastPropsCompatibility(options);
      return sonnerToast.info(message, sonnerOptions);
    }
    return sonnerToast.info(message);
  },
  
  /**
   * Display a warning toast notification
   */
  warning: (message: string, options?: ToastOptions | ToastT) => {
    if (typeof options === 'object') {
      const sonnerOptions = ensureToastPropsCompatibility(options);
      return sonnerToast.warning(message, sonnerOptions);
    }
    return sonnerToast.warning(message);
  },
  
  /**
   * Display a promise toast that updates based on promise resolution
   */
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    toastOptions?: ToastOptions | ToastT
  ) => {
    if (toastOptions) {
      const sonnerOptions = ensureToastPropsCompatibility(toastOptions);
      return sonnerToast.promise(promise, options, sonnerOptions);
    }
    return sonnerToast.promise(promise, options);
  },
  
  /**
   * Display a custom toast component
   */
  custom: (element: React.ReactNode, options?: ToastOptions | ToastT) => {
    if (options) {
      const sonnerOptions = ensureToastPropsCompatibility(options);
      return sonnerToast(element, sonnerOptions);
    }
    return sonnerToast(element);
  },
  
  /**
   * Display a default toast notification
   */
  default: (message: string, options?: ToastOptions | ToastT) => {
    if (options) {
      const sonnerOptions = ensureToastPropsCompatibility(options);
      return sonnerToast(message, sonnerOptions);
    }
    return sonnerToast(message);
  },
  
  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string) => {
    return sonnerToast.dismiss(toastId);
  }
};

/**
 * Hook to use toast notifications
 * Returns a toast object for component usage that includes a function to directly show toasts
 */
export function useToast() {
  return {
    toast: (options: ToastOptions | string) => {
      if (typeof options === 'string') {
        return sonnerToast(options);
      }
      return sonnerToast(ensureToastPropsCompatibility(options));
    }
  };
}
