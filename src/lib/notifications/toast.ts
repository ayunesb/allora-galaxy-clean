
import { toast, ToastOptions } from 'sonner';

interface ToastParams {
  title?: string;
  description?: string;
  variant?: string;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  icon?: string;
}

type ToastInput = string | ToastParams;

function normalizeToastParams(input: ToastInput): [string, string | undefined, ToastOptions] {
  if (typeof input === 'string') {
    return [input, undefined, {}];
  } else {
    const { title = '', description, variant, duration, position, icon } = input;
    const options: ToastOptions = {};
    
    if (description) options.description = description;
    if (duration) options.duration = duration;
    if (position) options.position = position;
    if (icon) options.icon = icon;
    
    return [title, description, options];
  }
}

/**
 * Show a success toast notification
 */
export function notifySuccess(input: ToastInput): void {
  const [title, description, options] = normalizeToastParams(input);
  toast.success(title, options);
}

/**
 * Show an error toast notification
 */
export function notifyError(input: ToastInput): void {
  const [title, description, options] = normalizeToastParams(input);
  toast.error(title, options);
}

/**
 * Show a warning toast notification
 */
export function notifyWarning(input: ToastInput): void {
  const [title, description, options] = normalizeToastParams(input);
  toast.warning(title, options);
}

/**
 * Show an info toast notification
 */
export function notifyInfo(input: ToastInput): void {
  const [title, description, options] = normalizeToastParams(input);
  toast.info(title, options);
}

/**
 * Show a neutral/default toast notification
 */
export function notifyDefault(input: ToastInput): void {
  const [title, description, options] = normalizeToastParams(input);
  toast(title, options);
}
