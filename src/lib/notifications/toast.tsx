
import { ReactNode } from 'react';
import { 
  notify as baseNotify, 
  notifySuccess as baseNotifySuccess,
  notifyError as baseNotifyError,
  notifyWarning as baseNotifyWarning,
  notifyInfo as baseNotifyInfo,
  notifyPromise as baseNotifyPromise,
  ToastOptions,
  ToastType,
  ToastPosition
} from '@/components/ui/sonner';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { SystemEventModule } from '@/types/shared';

type LoggedToastOptions = ToastOptions & {
  log?: boolean;
  logLevel?: 'info' | 'warning' | 'error';
  logModule?: SystemEventModule;
  tenantId?: string;
  logContext?: Record<string, any>;
};

/**
 * Extended toast notification function that can also log to the system
 */
export const notify = async (
  title: string, 
  options?: LoggedToastOptions & { type?: ToastType }
) => {
  const {
    type = 'default',
    log = false,
    logLevel = type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info',
    logModule = 'system',
    tenantId = 'system',
    logContext = {},
    description,
    ...restOptions
  } = options || {};
  
  // Show the toast notification
  const toastId = baseNotify(title, {
    type,
    description,
    ...restOptions
  });
  
  // Log the event if requested
  if (log) {
    try {
      await logSystemEvent(
        logModule,
        logLevel,
        {
          description: description?.toString() || title,
          toast_type: type,
          ...logContext
        },
        tenantId
      );
    } catch (error) {
      // Don't let logging errors affect the toast display
      console.error('Failed to log toast notification:', error);
    }
  }
  
  return toastId;
};

// Convenience methods that include logging capability
export const notifySuccess = (title: string, options?: Omit<LoggedToastOptions, "type">) => 
  notify(title, { ...options, type: "success" });

export const notifyError = (title: string, options?: Omit<LoggedToastOptions, "type">) => 
  notify(title, { ...options, type: "error", log: options?.log !== false });

export const notifyWarning = (title: string, options?: Omit<LoggedToastOptions, "type">) => 
  notify(title, { ...options, type: "warning" });

export const notifyInfo = (title: string, options?: Omit<LoggedToastOptions, "type">) => 
  notify(title, { ...options, type: "info" });

// Promise toast helper with logging
export const notifyPromise = async <T,>(
  promise: Promise<T>, 
  { 
    loading, 
    success, 
    error,
    log = true,
    logModule = 'system',
    tenantId = 'system',
    logContext = {}
  }: { 
    loading: string; 
    success: string | ((data: T) => string); 
    error: string | ((error: any) => string);
    log?: boolean;
    logModule?: SystemEventModule;
    tenantId?: string;
    logContext?: Record<string, any>;
  }
) => {
  try {
    // Show the loading toast
    const loadingToast = baseNotify(loading, { type: 'default' });
    
    // Wait for the promise to resolve
    const result = await promise;
    
    // Determine success message
    const successMessage = typeof success === "function" ? success(result) : success;
    
    // Log success if requested
    if (log) {
      await logSystemEvent(
        logModule,
        'info',
        {
          description: successMessage,
          toast_type: 'success',
          ...logContext
        },
        tenantId
      );
    }
    
    // Show success toast
    baseNotifySuccess(successMessage);
    
    return result;
  } catch (err) {
    // Determine error message
    const errorMessage = typeof error === "function" ? error(err) : error;
    
    // Log error if requested
    if (log) {
      await logSystemEvent(
        logModule,
        'error',
        {
          description: errorMessage,
          error: err,
          toast_type: 'error',
          ...logContext
        },
        tenantId
      );
    }
    
    // Show error toast
    baseNotifyError(errorMessage);
    
    throw err;
  }
};

/**
 * Hook for toast notifications with consistent styling and behavior
 */
export const useToast = () => {
  return {
    notify,
    success: notifySuccess,
    error: notifyError,
    warning: notifyWarning,
    info: notifyInfo,
    promise: notifyPromise
  };
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
) => {
  const toastType = type || (
    level === 'error' ? 'error' : 
    level === 'warning' ? 'warning' : 'info'
  );
  
  return notify(title, {
    description,
    type: toastType,
    log: true,
    logLevel: level,
    logModule: module,
    tenantId,
    logContext: additionalContext
  });
};

export default useToast;
