
/**
 * Toast notification utility
 * Provides a consistent API for displaying toast notifications throughout the app
 */

import { toast as sonnerToast } from 'sonner';

// Re-export toast with our custom configuration
export const toast = {
  /**
   * Show a success toast notification
   */
  success: (message: string, options = {}) => {
    return sonnerToast.success(message, {
      duration: 3000,
      ...options,
    });
  },

  /**
   * Show an error toast notification
   */
  error: (message: string, options = {}) => {
    return sonnerToast.error(message, {
      duration: 5000,
      ...options,
    });
  },

  /**
   * Show a warning toast notification
   */
  warning: (message: string, options = {}) => {
    return sonnerToast.warning(message, {
      duration: 4000,
      ...options,
    });
  },

  /**
   * Show an info toast notification
   */
  info: (message: string, options = {}) => {
    return sonnerToast.info(message, {
      duration: 3000,
      ...options,
    });
  },

  /**
   * Show a loading toast notification
   */
  loading: (message: string, options = {}) => {
    return sonnerToast.loading(message, {
      duration: 0, // Infinite duration, must be manually dismissed
      ...options,
    });
  },

  /**
   * Dismiss a toast notification
   */
  dismiss: (toastId?: string) => {
    sonnerToast.dismiss(toastId);
  }
};

export default toast;
