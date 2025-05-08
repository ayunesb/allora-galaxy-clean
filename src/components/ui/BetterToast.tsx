
import { toast as sonnerToast, Toast, ToastProps } from 'sonner';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Display a success toast notification
 */
export function notifySuccess(title: string, message?: string) {
  sonnerToast.success(title, { description: message });
}

/**
 * Display an error toast notification
 */
export function notifyError(title: string, message?: string) {
  sonnerToast.error(title, { description: message });
}

/**
 * Display a warning toast notification
 */
export function notifyWarning(title: string, message?: string) {
  sonnerToast.warning(title, { description: message });
}

/**
 * Display an info toast notification
 */
export function notifyInfo(title: string, message?: string) {
  sonnerToast.info(title, { description: message });
}

/**
 * Custom toast component for consistent styling
 */
export function BetterToast({ toast, position, ...props }: ToastProps) {
  const { id, title, description, action, type, cancel } = toast;

  const variantClassNames = {
    success: 'border-green-500/20 bg-green-500/10 text-green-500',
    error: 'border-red-500/20 bg-red-500/10 text-red-500',
    warning: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-500',
    info: 'border-blue-500/20 bg-blue-500/10 text-blue-500',
    default: 'border-gray-500/20 bg-gray-500/10 text-foreground',
  };

  const variant = type as ToastVariant || 'default';
  const toastClassName = variantClassNames[variant] || variantClassNames.default;

  return (
    <Toast
      className={cn(
        "group relative border p-3 rounded-xl shadow-lg",
        toastClassName
      )}
      {...props}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {type === 'success' && <CheckCircle className="h-5 w-5" />}
          {type === 'error' && <AlertCircle className="h-5 w-5" />}
          {type === 'warning' && <AlertTriangle className="h-5 w-5" />}
          {type === 'info' && <Info className="h-5 w-5" />}
        </div>
        <div className="flex-1 space-y-1">
          {title && <div className="font-semibold text-foreground">{title}</div>}
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
          
          {(action || cancel) && (
            <div className="mt-2 flex gap-2">
              {action && (
                <Button 
                  size="sm" 
                  onClick={() => {
                    action.onClick();
                    sonnerToast.dismiss(id);
                  }}
                >
                  {action.label}
                </Button>
              )}
              {cancel && (
                <Button 
                  size="sm"
                  variant="outline" 
                  onClick={() => {
                    if (cancel.onClick) cancel.onClick();
                    sonnerToast.dismiss(id);
                  }}
                >
                  {cancel.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Toast>
  );
}
