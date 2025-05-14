
import React from 'react';
import { EdgeFunctionError } from './EdgeFunctionErrorHandler';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { cn } from '@/lib/utils';
import RetryFeedback from '@/components/ui/retry-feedback';

export interface EdgeFunctionHandlerProps {
  isLoading: boolean;
  error?: any;
  children: React.ReactNode;
  onRetry?: () => void;
  showDetails?: boolean;
  loadingText?: string;
  className?: string;
  loadingComponent?: React.ReactNode;
  retryCount?: number;
  maxRetries?: number;
  isRetrying?: boolean;
}

/**
 * EdgeFunctionHandler - A component to handle loading and error states for edge function calls
 */
export const EdgeFunctionHandler: React.FC<EdgeFunctionHandlerProps> = ({
  isLoading,
  error,
  children,
  onRetry,
  showDetails = false,
  loadingText = 'Processing...',
  className,
  loadingComponent,
  retryCount = 0,
  maxRetries = 3,
  isRetrying = false,
}) => {
  if (isLoading) {
    return (
      <div className={cn("relative", className)}>
        {loadingComponent || (
          <LoadingIndicator text={loadingText} />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        {(retryCount > 0 || isRetrying) && onRetry && (
          <RetryFeedback
            retryCount={retryCount}
            maxRetries={maxRetries}
            isRetrying={isRetrying}
            onRetry={onRetry}
          />
        )}
        <EdgeFunctionError
          error={error}
          retry={onRetry}
          showDetails={showDetails}
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default EdgeFunctionHandler;
