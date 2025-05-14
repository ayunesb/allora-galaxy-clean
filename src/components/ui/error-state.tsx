
import { cn } from '@/lib/utils';
import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Error type/severity */
  variant?: 'default' | 'destructive' | 'warning';
  /** Whether to show retry button */
  retryable?: boolean;
  /** Retry function */
  onRetry?: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Consistent error state component to use across the app
 */
export function ErrorState({
  title,
  message,
  variant = 'default',
  retryable = false,
  onRetry,
  className,
}: ErrorStateProps) {
  const Icon = variant === 'destructive' 
    ? XCircle 
    : variant === 'warning' 
      ? AlertTriangle 
      : XCircle;
      
  const bgColor = variant === 'destructive' 
    ? 'bg-destructive/10' 
    : variant === 'warning' 
      ? 'bg-yellow-500/10' 
      : 'bg-muted/50';
      
  const borderColor = variant === 'destructive' 
    ? 'border-destructive/20' 
    : variant === 'warning' 
      ? 'border-yellow-500/20' 
      : 'border-muted';
      
  const iconColor = variant === 'destructive' 
    ? 'text-destructive' 
    : variant === 'warning' 
      ? 'text-yellow-500 dark:text-yellow-400' 
      : 'text-foreground';

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        bgColor,
        borderColor,
        className
      )}
      data-testid="error-state"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={cn('font-medium', iconColor)}>
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

/**
 * Full page error state component
 */
export function PageErrorState({
  title = "An error occurred",
  message,
  retryable = true,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex h-[50vh] w-full flex-col items-center justify-center p-4 text-center',
        className
      )}
      data-testid="page-error-state"
    >
      <XCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-muted-foreground">{message}</p>
      {retryable && onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="mt-6 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
