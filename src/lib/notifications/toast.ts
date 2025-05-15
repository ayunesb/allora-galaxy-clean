
import { toast, ToastOptions } from 'sonner';

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastParams {
  title?: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  icon?: React.ReactNode;
  [key: string]: any; // Allow additional options
}

export type ToastInput = string | ToastParams;

// For object-style calls
export function notify(params: ToastParams): void {
  const { title = '', description, variant = 'default', ...options } = params;
  
  const toastOptions: ToastOptions = {
    ...options,
    description
  };

  switch (variant) {
    case 'success':
      toast.success(title, toastOptions);
      break;
    case 'error':
      toast.error(title, toastOptions);
      break;
    case 'warning':
      toast.warning(title, toastOptions);
      break;
    case 'info':
      toast.info(title, toastOptions);
      break;
    default:
      toast.custom((t) => {
        // Custom toast can render React components directly
        return typeof title === 'string' ? title : 'Notification';
      }, toastOptions);
      break;
  }
}

// For string-style calls with optional config object
export function notifySuccess(title: string, options: Partial<ToastParams> = {}): void {
  toast.success(title, options);
}

export function notifyError(title: string, options: Partial<ToastParams> = {}): void {
  toast.error(title, options);
}

export function notifyWarning(title: string, options: Partial<ToastParams> = {}): void {
  toast.warning(title, options);
}

export function notifyInfo(title: string, options: Partial<ToastParams> = {}): void {
  toast.info(title, options);
}

export function notifyDefault(title: string, options: Partial<ToastParams> = {}): void {
  toast(title, options);
}

// Re-export useToast from sonner
export { useToast } from 'sonner';
