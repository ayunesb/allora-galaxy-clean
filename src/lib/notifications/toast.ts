import { toast } from '@/components/ui/use-toast';

/**
 * ToastType enum for distinguishing toast types
 */
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Generic notify function to show a toast
 */
export function notify(
  title: string, 
  message?: string, 
  type: ToastType = ToastType.INFO,
  options: Partial<ToastOptions> = {}
) {
  const { toast } = useToast();
  
  switch(type) {
    case ToastType.SUCCESS:
      return notifySuccess(title, message, options);
    case ToastType.ERROR:
      return notifyError(title, message, options);
    case ToastType.WARNING:
      return notifyWarning(title, message, options);
    case ToastType.INFO:
      return notifyInfo(title, message, options);
    default:
      return toast({
        title,
        description: message,
        ...options
      });
  }
}

/**
 * Display a success notification
 */
export const notifySuccess = (message: string, title = 'Success') => {
  toast({
    title,
    description: message,
    variant: 'default',
  });
};

/**
 * Display an error notification
 */
export const notifyError = (message: string, title = 'Error') => {
  toast({
    title,
    description: message,
    variant: 'destructive',
  });
};

/**
 * Display a warning notification
 */
export const notifyWarning = (message: string, title = 'Warning') => {
  toast({
    title,
    description: message,
    variant: 'warning',
  });
};

/**
 * Display an info notification
 */
export const notifyInfo = (message: string, title = 'Info') => {
  toast({
    title,
    description: message,
  });
};

/**
 * Display a notification for a promise with loading/success/error states
 */
export const notifyPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, {
    loading: { title: 'Loading', description: messages.loading },
    success: { title: 'Success', description: messages.success },
    error: { title: 'Error', description: messages.error },
  });
};

/**
 * Display a notification and log the event to system logs
 */
export const notifyAndLog = async (
  message: string,
  level: 'info' | 'warning' | 'error',
  module = 'ui',
  context = {}
) => {
  const { logSystemEvent } = await import('@/lib/system/logSystemEvent');
  
  switch (level) {
    case 'error':
      notifyError(message);
      break;
    case 'warning':
      notifyWarning(message);
      break;
    default:
      notifyInfo(message);
  }
  
  await logSystemEvent(
    module,
    level,
    {
      description: message,
      ...context
    }
  );
};

export { toast, useToast } from '@/components/ui/use-toast';
