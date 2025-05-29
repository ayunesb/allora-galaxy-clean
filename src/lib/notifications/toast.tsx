import { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import type { SystemEventModule } from "@/types/shared";

// Define toast types and options
export type ToastType = "default" | "success" | "error" | "warning" | "info";
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastOptions {
  description?: ReactNode;
  duration?: number;
  position?: ToastPosition;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
}

export interface ToastMessage {
  title: string;
  description?: ReactNode;
}

type LoggedToastOptions = ToastOptions & {
  log?: boolean;
  logLevel?: "info" | "warning" | "error";
  logModule?: SystemEventModule;
  tenantId?: string;
  logContext?: Record<string, any>;
};

/**
 * Base toast notification function
 */
export const notify = (
  messageOrOptions: string | ToastMessage,
  description?: string | ToastOptions,
  options?: ToastOptions,
): string => {
  // Handle different argument patterns for backward compatibility
  let title: string;
  let finalOptions: ToastOptions = {};

  // Handle the case where second argument is options object
  if (description && typeof description === "object") {
    options = description;
    description = undefined;
  }

  // Merge options
  finalOptions = { ...finalOptions, ...options };

  // Handle both string and object message formats
  if (typeof messageOrOptions === "string") {
    title = messageOrOptions;
    finalOptions.description =
      (description as string) || finalOptions.description;
  } else {
    title = messageOrOptions.title;
    finalOptions.description =
      messageOrOptions.description || finalOptions.description;
  }

  // Show the toast notification
  return sonnerToast(title, finalOptions);
};

/**
 * Helper functions for different toast types
 */
export const notifySuccess = (
  messageOrOptions: string | ToastMessage,
  description?: string | ToastOptions,
  options?: ToastOptions,
): string => {
  // Handle different argument patterns
  if (typeof description === "object") {
    options = description;
    description = undefined;
  }

  const finalOptions = { ...options };

  // Create toast with success variant
  if (typeof messageOrOptions === "string") {
    return sonnerToast.success(messageOrOptions, {
      description: description as string,
      ...finalOptions,
    });
  } else {
    return sonnerToast.success(messageOrOptions.title, {
      description: messageOrOptions.description,
      ...finalOptions,
    });
  }
};

export const notifyError = (
  messageOrOptions: string | ToastMessage,
  description?: string | ToastOptions,
  options?: ToastOptions,
): string => {
  // Handle different argument patterns
  if (typeof description === "object") {
    options = description;
    description = undefined;
  }

  const finalOptions = { ...options };

  // Create toast with error variant
  if (typeof messageOrOptions === "string") {
    return sonnerToast.error(messageOrOptions, {
      description: description as string,
      ...finalOptions,
    });
  } else {
    return sonnerToast.error(messageOrOptions.title, {
      description: messageOrOptions.description,
      ...finalOptions,
    });
  }
};

export const notifyWarning = (
  messageOrOptions: string | ToastMessage,
  description?: string | ToastOptions,
  options?: ToastOptions,
): string => {
  // Handle different argument patterns
  if (typeof description === "object") {
    options = description;
    description = undefined;
  }

  const finalOptions = { ...options };

  // Create toast with warning variant
  if (typeof messageOrOptions === "string") {
    return sonnerToast.warning(messageOrOptions, {
      description: description as string,
      ...finalOptions,
    });
  } else {
    return sonnerToast.warning(messageOrOptions.title, {
      description: messageOrOptions.description,
      ...finalOptions,
    });
  }
};

export const notifyInfo = (
  messageOrOptions: string | ToastMessage,
  description?: string | ToastOptions,
  options?: ToastOptions,
): string => {
  // Handle different argument patterns
  if (typeof description === "object") {
    options = description;
    description = undefined;
  }

  const finalOptions = { ...options };

  // Create toast with info variant
  if (typeof messageOrOptions === "string") {
    return sonnerToast.info(messageOrOptions, {
      description: description as string,
      ...finalOptions,
    });
  } else {
    return sonnerToast.info(messageOrOptions.title, {
      description: messageOrOptions.description,
      ...finalOptions,
    });
  }
};

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
  options?: ToastOptions,
): Promise<T> => {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...options,
  });
};

/**
 * Create a toast and log the event to the system logs
 */
export const notifyAndLog = async (
  module: SystemEventModule,
  level: "info" | "warning" | "error",
  title: string,
  description?: ReactNode,
  type?: ToastType,
  tenantId: string = "system",
  additionalContext: Record<string, any> = {},
): Promise<string> => {
  const toastType =
    type ||
    (level === "error" ? "error" : level === "warning" ? "warning" : "info");

  // Show the toast notification
  const toastId = notify(title, {
    description,
    type: toastType,
  });

  // Log the event
  try {
    await logSystemEvent(
      module,
      level,
      {
        description: description?.toString() || title,
        toast_type: toastType,
        ...additionalContext,
      },
      tenantId,
    );
  } catch (error) {
    console.error("Failed to log toast notification:", error);
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
    promise: notifyPromise,
  };
};

export default useToast;
