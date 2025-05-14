
import { cn } from '@/lib/utils';
import { XCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Whether to show a retry button */
  retryable?: boolean;
  /** Retry function */
  onRetry?: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Generic error state component for consistent error presentation
 */
export function ErrorState({
  title,
  message,
  severity = 'error',
  retryable = false,
  onRetry,
  className,
}: ErrorStateProps) {
  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[severity];
  
  const bgColors = {
    error: 'bg-destructive/10',
    warning: 'bg-yellow-500/10',
    info: 'bg-blue-500/10',
  };

  const borderColors = {
    error: 'border-destructive/30',
    warning: 'border-yellow-500/30',
    info: 'border-blue-500/30',
  };

  const textColors = {
    error: 'text-destructive',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div 
      className={cn(
        "rounded-md border p-4", 
        bgColors[severity], 
        borderColors[severity],
        className
      )}
      role="alert"
      aria-labelledby={title ? "error-title" : undefined}
      aria-describedby="error-message"
    >
      <div className="flex items-start">
        <div className="shrink-0">
          <Icon className={cn("h-5 w-5", textColors[severity])} />
        </div>
        <div className="ml-3">
          {title && (
            <h3 
              id="error-title"
              className={cn("text-sm font-medium", textColors[severity])}
            >
              {title}
            </h3>
          )}
          <div 
            id="error-message"
            className={cn("text-sm", title ? "mt-2" : "", severity === 'error' ? "text-destructive" : "text-muted-foreground")}
          >
            {message}
          </div>
          {retryable && onRetry && (
            <div className="mt-4">
              <Button 
                size="sm" 
                variant={severity === 'error' ? "destructive" : "outline"} 
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
