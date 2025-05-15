
import { toast as sonnerToast } from 'sonner';
import { ToastOptions } from '@/components/ui/sonner';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ExtendedToastOptions extends ToastOptions {
  variant?: ToastType;
}

// Enhanced toast function with variants
export const toast = Object.assign(
  (message: string | { title: string; description?: string }, options?: ExtendedToastOptions) => {
    if (typeof message === 'string') {
      return sonnerToast(message, options);
    } else {
      return sonnerToast(message.title, {
        description: message.description,
        ...options,
      });
    }
  },
  {
    success: (message: string | { title: string; description?: string }, options?: ToastOptions) => {
      if (typeof message === 'string') {
        return sonnerToast.success(message, options);
      } else {
        return sonnerToast.success(message.title, {
          description: message.description,
          ...options,
        });
      }
    },
    error: (message: string | { title: string; description?: string }, options?: ToastOptions) => {
      if (typeof message === 'string') {
        return sonnerToast.error(message, options);
      } else {
        return sonnerToast.error(message.title, {
          description: message.description,
          ...options,
        });
      }
    },
    warning: (message: string | { title: string; description?: string }, options?: ToastOptions) => {
      if (typeof message === 'string') {
        return sonnerToast.warning(message, options);
      } else {
        return sonnerToast.warning(message.title, {
          description: message.description,
          ...options,
        });
      }
    },
    info: (message: string | { title: string; description?: string }, options?: ToastOptions) => {
      if (typeof message === 'string') {
        return sonnerToast.info(message, options);
      } else {
        return sonnerToast.info(message.title, {
          description: message.description,
          ...options,
        });
      }
    },
    loading: (message: string | { title: string; description?: string }, options?: ToastOptions) => {
      if (typeof message === 'string') {
        return sonnerToast.loading(message, options);
      } else {
        return sonnerToast.loading(message.title, {
          description: message.description,
          ...options,
        });
      }
    },
    dismiss: sonnerToast.dismiss,
    custom: sonnerToast.custom,
    promise: sonnerToast.promise,
  }
);

export default toast;
