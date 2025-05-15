
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

interface RetryFeedbackProps {
  retryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  onRetry: () => void;
  className?: string;
}

/**
 * A component that shows retry status and controls for async operations
 * 
 * @param retryCount Number of retry attempts so far
 * @param maxRetries Maximum number of retries allowed
 * @param isRetrying Whether a retry is currently in progress
 * @param onRetry Callback function for retry action
 * @param className Optional CSS class name
 */
const RetryFeedback: React.FC<RetryFeedbackProps> = ({
  retryCount,
  maxRetries,
  isRetrying,
  onRetry,
  className
}) => {
  const attemptsText = retryCount === 1 ? 'attempt' : 'attempts';
  const retriesLeft = maxRetries - retryCount;
  const retriesText = retriesLeft === 1 ? 'retry' : 'retries';
  
  return (
    <div className={`bg-muted p-2.5 rounded-md text-xs ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isRetrying ? (
            <>
              <RotateCw className="h-3.5 w-3.5 mr-2 animate-spin" />
              <span>Retrying...</span>
            </>
          ) : (
            <span>
              {retryCount} {attemptsText} made. {retriesLeft} {retriesText} left.
            </span>
          )}
        </div>
        
        {!isRetrying && retriesLeft > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-2 py-0"
            onClick={onRetry}
            disabled={isRetrying}
          >
            <RotateCw className="h-3 w-3 mr-1" />
            Retry Now
          </Button>
        )}
      </div>
    </div>
  );
};

// Export memoized component for performance optimization
export default memo(RetryFeedback);
