
import { cn } from '@/lib/utils';
import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Error type/severity */
  variant?: 'default' | 'destructive' | 'warning' | 'info';
  /** Whether to show retry button */
  retryable?: boolean;
  /** Retry function */
  onRetry?: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Standardized error state component
 */
export function ErrorState({
  title,
  message,
  variant = 'default',
  retryable = false,
  onRetry,
  className,
}: ErrorStateProps) {
  // Determine icon based on variant
  const IconMap = {
    destructive: XCircle,
    warning: AlertTriangle,
    info: AlertTriangle,
    default: XCircle
  };
  
  const Icon = IconMap[variant];
  
  // Determine styling based on variant
  const bgColors = {
    destructive: 'bg-destructive/10',
    warning: 'bg-yellow-500/10',
    info: 'bg-blue-500/10',
    default: 'bg-muted/50'
  };
  
  const borderColors = {
    destructive: 'border-destructive/20',
    warning: 'border-yellow-500/20',
    info: 'border-blue-500/20',
    default: 'border-muted'
  };
  
  const iconColors = {
    destructive: 'text-destructive',
    warning: 'text-yellow-500 dark:text-yellow-400',
    info: 'text-blue-500 dark:text-blue-400',
    default: 'text-foreground'
  };

  return (
    <div
      className={cn(
        'rounded-md border p-4',
        bgColors[variant],
        borderColors[variant],
        className
      )}
      data-testid="error-state"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', iconColors[variant])} />
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={cn('font-medium', iconColors[variant])}>
              {title}
            </h3>
          )}
          <div className={cn('text-sm', title ? 'mt-2' : '')}>
            {message}
          </div>
          {retryable && onRetry && (
            <div className="mt-4">
              <Button
                size="sm"
                variant="outline"
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
