
import { cn } from '@/lib/utils';
import { XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PageErrorProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Whether to show retry button */
  retryable?: boolean;
  /** Retry function */
  onRetry?: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Full page error state component
 */
export function PageError({
  title = "An error occurred",
  message,
  retryable = true,
  onRetry,
  className,
}: PageErrorProps) {
  return (
    <div
      className={cn(
        'flex h-[50vh] w-full flex-col items-center justify-center p-4 text-center',
        className
      )}
      data-testid="page-error"
      role="alert"
      aria-live="assertive"
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
