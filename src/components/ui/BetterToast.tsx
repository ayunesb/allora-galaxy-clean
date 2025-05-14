
import { toast as sonnerToast } from 'sonner';

// Type definitions
export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

// Notification variants
export function notify(message: string, options?: ToastOptions) {
  return sonnerToast(message, options);
}

export function notifySuccess(message: string, options?: ToastOptions) {
  return sonnerToast.success(message, options);
}

export function notifyError(message: string, options?: ToastOptions) {
  return sonnerToast.error(message, options);
}

export function notifyWarning(message: string, options?: ToastOptions) {
  return sonnerToast.warning(message, options);
}

export function notifyInfo(message: string, options?: ToastOptions) {
  return sonnerToast.info(message, options);
}

export function notifyLoading(message: string, options?: ToastOptions) {
  return sonnerToast.loading(message, options);
}

export default {
  notify,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  notifyLoading
};
