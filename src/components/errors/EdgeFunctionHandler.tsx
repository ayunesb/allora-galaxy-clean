
import React, { useState, useCallback, useEffect } from 'react';
import { EdgeFunctionError } from './EdgeFunctionErrorHandler';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { cn } from '@/lib/utils';
import RetryFeedback from '@/components/ui/retry-feedback';
import { reportApiError } from '@/lib/telemetry/errorReporter';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

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
  functionName?: string;
  autoRetry?: boolean;
  fallback?: React.ReactNode;
}

/**
 * EdgeFunctionHandler - An enhanced component to handle loading and error states for edge function calls
 * Includes telemetry integration and auto-retry functionality
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
  functionName = 'unknown',
  autoRetry = false,
  fallback
}) => {
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [autoRetrying, setAutoRetrying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Report errors to telemetry system
  useEffect(() => {
    if (error && !autoRetrying) {
      reportApiError(functionName, error, undefined, {
        context: {
          retryCount: retryCount + autoRetryCount,
          component: 'EdgeFunctionHandler',
          autoRetry
        }
      }).catch(reportError => {
        console.error('Failed to report edge function error:', reportError);
      });
    }
  }, [error, functionName, retryCount, autoRetryCount, autoRetrying]);

  // Handle auto retry with exponential backoff
  const handleAutoRetry = useCallback(async () => {
    if (!onRetry || autoRetryCount >= maxRetries || !error) return;
    
    const backoffMs = Math.min(1000 * Math.pow(2, autoRetryCount), 10000);
    setAutoRetrying(true);
    setCountdown(Math.floor(backoffMs / 1000));
    
    // Update countdown timer
    const intervalId = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    
    // Wait for backoff period
    await new Promise(resolve => setTimeout(resolve, backoffMs));
    clearInterval(intervalId);
    
    setAutoRetryCount(count => count + 1);
    setAutoRetrying(false);
    
    // Execute retry
    onRetry();
  }, [onRetry, autoRetryCount, maxRetries, error]);
  
  // Auto retry if enabled
  useEffect(() => {
    if (autoRetry && error && !autoRetrying && autoRetryCount < maxRetries) {
      handleAutoRetry();
    }
  }, [autoRetry, error, autoRetrying, autoRetryCount, maxRetries, handleAutoRetry]);

  // Loading state rendering
  if (isLoading) {
    return (
      <div className={cn("relative", className)}>
        {loadingComponent || (
          <LoadingIndicator text={loadingText} />
        )}
      </div>
    );
  }

  // Error state rendering
  if (error) {
    // Use fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    const totalRetryCount = retryCount + autoRetryCount;
    const totalRetrying = isRetrying || autoRetrying;
    
    return (
      <div className={cn("space-y-4", className)}>
        {(totalRetryCount > 0 || totalRetrying) && (
          <div className="bg-muted p-3 rounded-md">
            <RetryFeedback
              retryCount={totalRetryCount}
              maxRetries={maxRetries}
              isRetrying={totalRetrying}
              onRetry={onRetry}
            />
            
            {autoRetrying && countdown > 0 && (
              <div className="flex items-center mt-2 text-xs">
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                <span>Auto-retrying in {countdown} seconds...</span>
              </div>
            )}
          </div>
        )}
        
        <EdgeFunctionError
          error={error}
          retry={onRetry}
          showDetails={showDetails}
        />
        
        {autoRetry && autoRetryCount >= maxRetries && onRetry && (
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setAutoRetryCount(0);
                onRetry();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset and Try Again
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Default case: render children
  return <>{children}</>;
};

export default React.memo(EdgeFunctionHandler);
