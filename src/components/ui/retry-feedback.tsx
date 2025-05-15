
import React from 'react';
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RetryFeedbackProps {
  retryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  onRetry?: () => void;
  className?: string;
}

/**
 * Displays retry status and controls for operations that can be retried
 * 
 * @component 
 * @param {Object} props - Component props
 * @param {number} props.retryCount - Current retry attempt count
 * @param {number} props.maxRetries - Maximum number of retries allowed
 * @param {boolean} props.isRetrying - Whether a retry is currently in progress
 * @param {Function} [props.onRetry] - Callback for retry button
 * @param {string} [props.className] - Additional CSS classes
 */
const RetryFeedback: React.FC<RetryFeedbackProps> = ({
  retryCount,
  maxRetries,
  isRetrying,
  onRetry,
  className
}) => {
  const retriesExhausted = retryCount >= maxRetries;
  const retriesRemaining = Math.max(0, maxRetries - retryCount);
  
  return (
    <div className={cn(
      "text-sm flex items-center gap-2",
      isRetrying ? "text-muted-foreground" : retriesExhausted ? "text-destructive" : "text-muted-foreground",
      className
    )}>
      {isRetrying ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Retrying... (Attempt {retryCount + 1} of {maxRetries})</span>
        </>
      ) : retriesExhausted ? (
        <>
          <AlertCircle className="h-4 w-4" />
          <span>All {maxRetries} retry attempts failed</span>
          {onRetry && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto h-7 px-2"
              onClick={onRetry}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Try again
            </Button>
          )}
        </>
      ) : retryCount === 0 ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>First attempt</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          <span>
            Retried {retryCount} {retryCount === 1 ? 'time' : 'times'}{' '}
            ({retriesRemaining} {retriesRemaining === 1 ? 'retry' : 'retries'} remaining)
          </span>
          {onRetry && !isRetrying && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto h-7 px-2"
              onClick={onRetry}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Retry
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default RetryFeedback;
