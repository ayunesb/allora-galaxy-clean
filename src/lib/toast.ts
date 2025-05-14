
import { toast as sonnerToast, Toast, ToastT } from "sonner";

export type ToastProps = ToastT;

/**
 * Standardized toast utility using Sonner
 */
export const toast = {
  /**
   * Display a success toast notification
   */
  success: (message: string, options?: ToastProps) => {
    return sonnerToast.success(message, options);
  },
  
  /**
   * Display an error toast notification
   */
  error: (message: string, options?: ToastProps) => {
    return sonnerToast.error(message, options);
  },
  
  /**
   * Display an info toast notification
   */
  info: (message: string, options?: ToastProps) => {
    return sonnerToast.info(message, options);
  },
  
  /**
   * Display a warning toast notification
   */
  warning: (message: string, options?: ToastProps) => {
    return sonnerToast.warning(message, options);
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
    toastOptions?: ToastProps
  ) => {
    return sonnerToast.promise(promise, options, toastOptions);
  },
  
  /**
   * Display a custom toast component
   */
  custom: (element: React.ReactNode, options?: ToastProps) => {
    return sonnerToast(element, options);
  },
  
  /**
   * Display a default toast notification
   */
  default: (message: string, options?: ToastProps) => {
    return sonnerToast(message, options);
  },
  
  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string) => {
    return sonnerToast.dismiss(toastId);
  }
};
