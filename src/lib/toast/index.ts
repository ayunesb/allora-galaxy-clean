
/**
 * Unified Toast Notification System
 * 
 * This module provides a centralized toast notification system for Allora OS.
 * It handles all toast notifications consistently throughout the application.
 */
import { toast as sonnerToast } from 'sonner';
import type { ToastT } from 'sonner';

export type ToastProps = ToastT;
export type ToastActionElement = React.ReactElement<any, any>;

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
  id?: string;
  onDismiss?: () => void;
  action?: ToastActionElement;
}

/**
 * Convert our unified toast options to Sonner's format
 */
const toSonnerFormat = (options: ToastOptions | ToastT): ToastT => {
  // If it already has an id property, assume it's a valid Sonner toast prop
  if ('id' in options) {
    return options as ToastT;
  }
  
  // Convert our format to Sonner format
  const { variant, ...rest } = options as ToastOptions;
  return {
    id: rest.id || String(Date.now()),
    ...rest
  };
};

/**
 * Main toast function that can be called directly
 */
const showToast = (options: ToastOptions | string) => {
  if (typeof options === 'string') {
    return sonnerToast(options);
  }
  return sonnerToast(toSonnerFormat(options));
};

/**
 * Unified toast notification system
 */
export const toast = Object.assign(showToast, {
  success: (message: string, options?: ToastOptions | ToastT) => {
    if (typeof options === 'object') {
      return sonnerToast.success(message, toSonnerFormat(options));
    }
    return sonnerToast.success(message);
  },
  
  error: (message: string, options?: ToastOptions | ToastT) => {
    if (typeof options === 'object') {
      return sonnerToast.error(message, toSonnerFormat(options));
    }
    return sonnerToast.error(message);
  },
  
  info: (message: string, options?: ToastOptions | ToastT) => {
    if (typeof options === 'object') {
      return sonnerToast.info(message, toSonnerFormat(options));
    }
    return sonnerToast.info(message);
  },
  
  warning: (message: string, options?: ToastOptions | ToastT) => {
    if (typeof options === 'object') {
      return sonnerToast.warning(message, toSonnerFormat(options));
    }
    return sonnerToast.warning(message);
  },
  
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
      return sonnerToast.promise(promise, options, toSonnerFormat(toastOptions));
    }
    return sonnerToast.promise(promise, options);
  },
  
  custom: (element: React.ReactNode, options?: ToastOptions | ToastT) => {
    if (options) {
      return sonnerToast(element, toSonnerFormat(options));
    }
    return sonnerToast(element);
  },
  
  dismiss: (toastId?: string) => {
    return sonnerToast.dismiss(toastId);
  }
});

/**
 * Hook for using toast notifications in components
 */
export function useToast() {
  return { toast: showToast };
}

/**
 * Convenience methods for common notification patterns
 */
export const notify = {
  success: (message: string, title?: string) => {
    return toast.success(message, {
      description: title,
      duration: 5000,
    });
  },
  
  error: (message: string, title?: string) => {
    return toast.error(message, {
      description: title,
      duration: 8000, // Errors stay longer
    });
  },
  
  warning: (message: string, title?: string) => {
    return toast.warning(message, {
      description: title,
      duration: 6000,
    });
  },
  
  info: (message: string, title?: string) => {
    return toast.info(message, {
      description: title,
      duration: 5000,
    });
  }
};

/**
 * Display API loading states as toast notifications
 */
export function toastPromise<T>(
  promise: Promise<T>, 
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) {
  return toast.promise(promise, messages, {
    duration: 5000,
  });
}
