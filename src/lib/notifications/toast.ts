
import { toast as sonnerToast } from 'sonner';

// Define toast types
type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  icon?: React.ReactNode;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Create a wrapper for the toast function
export const toast = {
  show: (message: string, options?: ToastOptions) => {
    return sonnerToast(message, options);
  },
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, options);
  },
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, options);
  },
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, options);
  },
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, options);
  },
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, messages, options);
  },
  dismiss: (toastId?: string) => {
    return sonnerToast.dismiss(toastId);
  },
  custom: (component: React.ReactNode, options?: ToastOptions) => {
    return sonnerToast.custom(component, options);
  },
};

// Export named toast for compatibility
export { toast };
