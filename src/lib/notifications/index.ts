
import { toast } from '@/lib/toast';

export { toast };

/**
 * Display a notification with consistent styling
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
