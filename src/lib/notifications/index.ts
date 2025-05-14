
import { toast } from 'sonner';

type NotificationOptions = {
  duration?: number;
  id?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const notify = {
  success: (message: string, options?: NotificationOptions) => {
    return toast.success(message, options);
  },
  
  error: (message: string, options?: NotificationOptions) => {
    return toast.error(message, options);
  },
  
  info: (message: string, options?: NotificationOptions) => {
    return toast.info(message, options);
  },
  
  warning: (message: string, options?: NotificationOptions) => {
    return toast.warning(message, options);
  },
  
  loading: (message: string, options?: NotificationOptions) => {
    return toast.loading(message, options);
  },
  
  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
  },
  
  // For promise-based operations
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
    options?: NotificationOptions
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    }, options);
  }
};
