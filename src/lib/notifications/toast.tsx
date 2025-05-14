
import { ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import type { SystemEventModule } from '@/types/shared';

// Define toast types and options
export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastOptions {
  description?: ReactNode;
  duration?: number;
  position?: ToastPosition;
  action?: {
    label: string;
    onClick: () => void;
  };
}

type LoggedToastOptions = ToastOptions & {
  log?: boolean;
  logLevel?: 'info' | 'warning' | 'error';
  logModule?: SystemEventModule;
  tenantId?: string;
  logContext?: Record<string, any>;
};

/**
 * Base toast notification function
 */
export const notify = (
  title: string, 
  options?: LoggedToastOptions & { type?: ToastType }
): string => {
  const {
    type = 'default',
    description,
    duration,
    position,
    action,
    ...restOptions
  } = options || {};
  
  // Show the toast notification
  return sonnerToast[type] ? 
    sonnerToast[type](title, { description, duration, position, action }) : 
    sonnerToast(title, { description, duration, position, action });
};

/**
 * Helper functions for different toast types
 */
export const notifySuccess = (title: string, options?: ToastOptions) => 
  notify(title, { ...options, type: "success" });

export const notifyError = (title: string, options?: ToastOptions) => 
  notify(title, { ...options, type: "error" });

export const notifyWarning = (title: string, options?: ToastOptions) => 
  notify(title, { ...options, type: "warning" });

export const notifyInfo = (title: string, options?: ToastOptions) => 
  notify(title, { ...options, type: "info" });

/**
 * Promise toast helper that shows loading/success/error states
 */
export const notifyPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ToastOptions
): Promise<T> => {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...options
  });
};

/**
 * Create a toast and log the event to the system logs
 */
export const notifyAndLog = async (
  module: SystemEventModule,
  level: 'info' | 'warning' | 'error',
  title: string,
  description?: ReactNode,
  type?: ToastType,
  tenantId: string = 'system',
  additionalContext: Record<string, any> = {}
): Promise<string> => {
  const toastType = type || (
    level === 'error' ? 'error' : 
    level === 'warning' ? 'warning' : 'info'
  );
  
  // Show the toast notification
  const toastId = notify(title, {
    description,
    type: toastType
  });
  
  // Log the event
  try {
    await logSystemEvent(
      module,
      level,
      {
        description: description?.toString() || title,
        toast_type: toastType,
        ...additionalContext
      },
      tenantId
    );
  } catch (error) {
    console.error('Failed to log toast notification:', error);
  }
  
  return toastId;
};

/**
 * Hook for toast notifications with consistent styling and behavior
 */
export const useToast = () => {
  return {
    toast: sonnerToast,
    notify,
    success: notifySuccess,
    error: notifyError,
    warning: notifyWarning,
    info: notifyInfo,
    promise: notifyPromise
  };
};

export default useToast;
