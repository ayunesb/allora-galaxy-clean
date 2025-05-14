
import React from 'react';
import { AlertTriangle, Loader2, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface RetryFeedbackProps {
  retryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  onRetry?: () => void;
  className?: string;
  showProgress?: boolean;
  showButton?: boolean;
  message?: string;
}

/**
 * Component to show retry feedback to users during automatic retries
 */
const RetryFeedback: React.FC<RetryFeedbackProps> = ({
  retryCount,
  maxRetries,
  isRetrying,
  onRetry,
  className,
  showProgress = true,
  showButton = true,
  message
}) => {
  if (retryCount === 0 && !isRetrying) {
    return null;
  }
  
  const progress = (retryCount / maxRetries) * 100;

  return (
    <div className={cn(
      "flex flex-col gap-2 p-2 rounded-md border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 text-sm",
      className
    )}>
      <div className="flex items-center gap-2">
        {isRetrying ? (
          <Loader2 className="h-4 w-4 text-orange-600 dark:text-orange-400 animate-spin" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        )}
        <span className="text-orange-800 dark:text-orange-300">
          {message || (
            isRetrying 
              ? `Retrying (${retryCount}/${maxRetries})...` 
              : `Retried ${retryCount} time${retryCount !== 1 ? 's' : ''}`
          )}
        </span>
      </div>
      
      {showProgress && isRetrying && (
        <Progress value={progress} className="h-1 bg-orange-200 dark:bg-orange-800">
          <div 
            className="h-full bg-orange-500 dark:bg-orange-400"
            style={{ width: `${progress}%` }}
          />
        </Progress>
      )}
      
      {showButton && onRetry && !isRetrying && (
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-1 py-1 px-3 text-xs 
            rounded-sm bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 
            dark:hover:bg-orange-800 text-orange-800 dark:text-orange-300
            transition-colors"
        >
          <RefreshCcw className="h-3 w-3" />
          Retry manually
        </button>
      )}
    </div>
  );
};

export default RetryFeedback;
