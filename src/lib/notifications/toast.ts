
import { toast as sonnerToast } from "sonner";

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  promise?: Promise<any>;
  onSuccess?: string | ((data: any) => string);
  onError?: string | ((error: Error) => string);
}

/**
 * General notification function
 */
export function notify(message: string, options?: ToastOptions & { variant?: ToastType }) {
  const { variant = 'default', ...rest } = options || {};
  
  return sonnerToast[variant](message, rest);
}

/**
 * Success notification
 */
export function notifySuccess(message: string, options?: ToastOptions) {
  return notify(message, { ...options, variant: 'success' });
}

/**
 * Error notification
 */
export function notifyError(message: string, options?: ToastOptions) {
  return notify(message, { ...options, variant: 'error' });
}

/**
 * Warning notification
 */
export function notifyWarning(message: string, options?: ToastOptions) {
  return notify(message, { ...options, variant: 'warning' });
}

/**
 * Info notification
 */
export function notifyInfo(message: string, options?: ToastOptions) {
  return notify(message, { ...options, variant: 'info' });
}

/**
 * Promise-based notification that shows loading, success, and error states
 */
export function notifyPromise<T>(
  promise: Promise<T>,
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  }
) {
  return sonnerToast.promise(promise, options);
}

/**
 * Notify and log to system logs simultaneously
 */
export function notifyAndLog(
  message: string,
  options: {
    variant?: ToastType;
    module?: string;
    level?: 'info' | 'warning' | 'error';
    context?: Record<string, any>;
    tenant_id?: string;
  } = {}
) {
  const { variant = 'default', module = 'system', level = 'info', context, tenant_id } = options;
  
  // Log to system logs
  import('@/lib/system/logSystemEvent').then(({ logSystemEvent }) => {
    logSystemEvent(
      module,
      level,
      { description: message, ...context },
      tenant_id
    ).catch(err => console.error('Failed to log event:', err));
  });
  
  // Show notification
  return notify(message, { variant });
}

/**
 * Hook for accessing toast functionality within components
 */
export function useToast() {
  return {
    toast: notify,
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyPromise,
    notifyAndLog
  };
}
