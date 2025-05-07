
import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: React.ReactNode;
  logToSystem?: boolean;
  tenant_id?: string;
}

export const BetterToast: React.FC<{
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: React.ReactNode;
  onClose?: () => void;
}> = ({ title, description, variant = 'default', action, onClose }) => {
  const icons = {
    default: null,
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    destructive: <AlertTriangle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  return (
    <div className={cn(
      "flex w-full bg-background border rounded-md shadow-lg",
      variant === 'destructive' ? "border-red-600" :
      variant === 'warning' ? "border-yellow-600" :
      variant === 'success' ? "border-green-600" :
      variant === 'info' ? "border-blue-600" : "border-gray-200",
    )}>
      {icons[variant] && (
        <div className={cn(
          "flex items-center justify-center p-3",
          variant === 'destructive' ? "bg-red-50 dark:bg-red-900/20" :
          variant === 'warning' ? "bg-yellow-50 dark:bg-yellow-900/20" :
          variant === 'success' ? "bg-green-50 dark:bg-green-900/20" :
          variant === 'info' ? "bg-blue-50 dark:bg-blue-900/20" : ""
        )}>
          {icons[variant]}
        </div>
      )}
      <div className="flex-1 flex flex-col gap-1 p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{title}</h3>
          {onClose && (
            <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex items-center pr-3">{action}</div>}
    </div>
  );
};

// Helper function to create toasts with system logging
export function showToast(options: ToastOptions) {
  const { title, description, variant, duration, action, logToSystem, tenant_id } = options;
  
  // Log to system if requested
  if (logToSystem && variant !== 'default' && variant !== 'success') {
    const logLevel = variant === 'destructive' ? 'error' : (variant === 'warning' ? 'warning' : 'info');
    
    try {
      const { logSystemEvent } = require('@/lib/system/logSystemEvent');
      logSystemEvent(
        tenant_id || 'system',
        'ui', 
        `toast_${logLevel}`,
        { title, description }
      ).catch((err: any) => {
        console.error('Failed to log toast to system:', err);
      });
    } catch (err) {
      console.error('Could not import logSystemEvent:', err);
    }
  }
  
  return toast({
    title,
    description,
    variant,
    duration,
    action,
  });
}

export function notifySuccess(title: string, description?: string, options: Partial<ToastOptions> = {}) {
  return showToast({
    title,
    description,
    variant: 'success',
    duration: 4000,
    ...options
  });
}

export function notifyError(title: string, description?: string, options: Partial<ToastOptions> = {}) {
  return showToast({
    title,
    description,
    variant: 'destructive',
    duration: 6000,
    logToSystem: true,
    ...options
  });
}

export function notifyWarning(title: string, description?: string, options: Partial<ToastOptions> = {}) {
  return showToast({
    title,
    description,
    variant: 'warning',
    duration: 5000,
    logToSystem: true,
    ...options
  });
}

export function notifyInfo(title: string, description?: string, options: Partial<ToastOptions> = {}) {
  return showToast({
    title,
    description,
    variant: 'info',
    duration: 4000,
    ...options
  });
}
