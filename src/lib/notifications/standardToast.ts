
import { toast, ToastOptions } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

/**
 * Standard toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

/**
 * Options for the standard toast notification
 */
export interface StandardToastOptions extends Omit<ToastOptions, 'variant'> {
  /**
   * Whether to automatically log this notification to the system_logs table
   */
  log?: boolean;
  /**
   * Additional data to include in the log
   */
  logData?: Record<string, any>;
  /**
   * Module name for the log entry
   */
  module?: string;
  /**
   * Event name for the log entry
   */
  event?: string;
  /**
   * Tenant ID for the log entry
   */
  tenantId?: string;
}

/**
 * Toast notification utility with consistent styling and optional system logging
 */
export const standardToast = {
  /**
   * Show a success toast notification
   */
  success: (
    title: string,
    description?: string,
    options?: StandardToastOptions
  ) => {
    const toastId = toast({
      title,
      description,
      variant: 'default',
      className: 'bg-green-50 border-green-600 dark:bg-green-900/30',
      ...options
    }).id;
    
    if (options?.log) {
      logToastEvent('success', title, description, options);
    }
    
    return toastId;
  },
  
  /**
   * Show an error toast notification
   */
  error: (
    title: string,
    description?: string,
    options?: StandardToastOptions
  ) => {
    const toastId = toast({
      title,
      description,
      variant: 'destructive',
      ...options
    }).id;
    
    if (options?.log) {
      logToastEvent('error', title, description, options);
    }
    
    return toastId;
  },
  
  /**
   * Show a warning toast notification
   */
  warning: (
    title: string,
    description?: string,
    options?: StandardToastOptions
  ) => {
    const toastId = toast({
      title,
      description,
      variant: 'default',
      className: 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/30',
      ...options
    }).id;
    
    if (options?.log) {
      logToastEvent('warning', title, description, options);
    }
    
    return toastId;
  },
  
  /**
   * Show an info toast notification
   */
  info: (
    title: string,
    description?: string,
    options?: StandardToastOptions
  ) => {
    const toastId = toast({
      title,
      description,
      variant: 'default',
      className: 'bg-blue-50 border-blue-500 dark:bg-blue-900/30',
      ...options
    }).id;
    
    if (options?.log) {
      logToastEvent('info', title, description, options);
    }
    
    return toastId;
  },
  
  /**
   * Show a loading toast notification
   */
  loading: (
    title: string,
    description?: string,
    options?: StandardToastOptions
  ) => {
    const toastId = toast({
      title,
      description,
      variant: 'default',
      className: 'bg-slate-50 border-slate-500 dark:bg-slate-900/30',
      ...options
    }).id;
    
    if (options?.log) {
      logToastEvent('loading', title, description, options);
    }
    
    return toastId;
  },
  
  /**
   * Update an existing toast notification
   */
  update: (
    id: string | number,
    options: {
      title?: string;
      description?: string;
      type?: ToastType;
      duration?: number;
    }
  ) => {
    const { type, ...rest } = options;
    let className = '';
    
    if (type === 'success') {
      className = 'bg-green-50 border-green-600 dark:bg-green-900/30';
    } else if (type === 'error') {
      rest.variant = 'destructive';
    } else if (type === 'warning') {
      className = 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/30';
    } else if (type === 'info') {
      className = 'bg-blue-50 border-blue-500 dark:bg-blue-900/30';
    } else if (type === 'loading') {
      className = 'bg-slate-50 border-slate-500 dark:bg-slate-900/30';
    }
    
    toast({
      ...rest,
      id,
      className: className || undefined
    });
    
    return id;
  },
  
  /**
   * Dismiss a toast notification
   */
  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },
  
  /**
   * Handle a promise with toast notifications for loading, success, and error states
   */
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: StandardToastOptions
  ): Promise<T> => {
    const toastId = standardToast.loading(loading, undefined, options);
    
    return promise
      .then((data) => {
        const successMessage = typeof success === 'function' ? success(data) : success;
        standardToast.update(toastId, { 
          title: successMessage,
          type: 'success',
          duration: options?.duration || 3000
        });
        return data;
      })
      .catch((err) => {
        const errorMessage = typeof error === 'function' ? error(err) : error;
        standardToast.update(toastId, { 
          title: errorMessage,
          type: 'error',
          duration: options?.duration || 5000
        });
        throw err;
      });
  }
};

/**
 * Log a toast event to the system_logs table
 */
async function logToastEvent(
  type: ToastType,
  title: string,
  description?: string,
  options?: StandardToastOptions
) {
  try {
    // Map toast type to log level
    const level = type === 'error' ? 'error' :
                 type === 'warning' ? 'warn' :
                 'info';
    
    // Create context data
    const context = {
      title,
      description,
      ...options?.logData
    };
    
    // Log to system_logs table
    await supabase.from('system_logs').insert({
      module: options?.module || 'ui',
      event: options?.event || `toast_${type}`,
      context,
      tenant_id: options?.tenantId || 'system'
    });
  } catch (error) {
    // Silent fail - logging shouldn't break the application
    console.error('Failed to log toast notification:', error);
  }
}
