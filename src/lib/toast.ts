
import { toast as sonnerToast, type ToastOptions } from "sonner";

type NotifyOptions = ToastOptions & {
  id?: string;
};

export const toast = {
  /**
   * Show a default toast notification
   */
  message: (message: string, options?: NotifyOptions) => {
    return sonnerToast(message, options);
  },
  
  /**
   * Show a success toast notification
   */
  success: (message: string, options?: NotifyOptions) => {
    return sonnerToast.success(message, options);
  },
  
  /**
   * Show an error toast notification
   */
  error: (message: string, options?: NotifyOptions) => {
    return sonnerToast.error(message, options);
  },
  
  /**
   * Show a warning toast notification
   */
  warning: (message: string, options?: NotifyOptions) => {
    return sonnerToast.warning(message, options);
  },
  
  /**
   * Show an info toast notification
   */
  info: (message: string, options?: NotifyOptions) => {
    return sonnerToast.info(message, options);
  },
  
  /**
   * Show a loading toast notification
   */
  loading: (message: string, options?: NotifyOptions) => {
    return sonnerToast.loading(message, options);
  },
  
  /**
   * Dismiss a toast notification
   */
  dismiss: (toastId?: string) => {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    } else {
      sonnerToast.dismiss();
    }
  },
  
  /**
   * Handle promise with toast notifications
   */
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: NotifyOptions
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    }, options);
  },
  
  /**
   * Create a custom toast notification
   */
  custom: (render: React.ReactNode, options?: NotifyOptions) => {
    return sonnerToast.custom(render, options);
  }
};
