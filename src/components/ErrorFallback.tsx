
import React, { useState, useEffect } from 'react';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import ErrorState from '@/components/errors/ErrorState';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';
import { reportErrorFromErrorBoundary } from '@/lib/telemetry/errorReporter';
import { Progress } from '@/components/ui/progress';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentStack?: string | null;
  reachedMaxRetries?: boolean;
  maxRetries?: number;
  retryCount?: number;
}

/**
 * An enhanced fallback component displayed when an error is caught by an error boundary
 * Includes retry mechanism and better UX for error states
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  componentStack,
  reachedMaxRetries = false,
  maxRetries = 3,
  retryCount = 0
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [reported, setReported] = useState(false);

  // Log the error to system events and telemetry
  useEffect(() => {
    if (!reported) {
      // Log to system events
      logSystemEvent('ui', 'error', {
        description: `UI Error: ${error.message}`,
        stack: error.stack,
        componentStack,
        react_error_boundary: true,
        retry_count: retryCount
      }).catch(logError => {
        console.error('Failed to log error to system events:', logError);
      });

      // Report to telemetry
      reportErrorFromErrorBoundary(error, { componentStack }, {
        context: { 
          retryCount,
          reachedMaxRetries,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      }).catch(telemetryError => {
        console.error('Failed to report error to telemetry:', telemetryError);
      });

      setReported(true);
    }
  }, [error, componentStack, retryCount, reachedMaxRetries, reported]);

  // Auto-retry handler with increasing backoff
  const handleRetry = async () => {
    if (isRetrying) return;

    const backoffSeconds = Math.min(2 * (retryCount + 1), 10);
    setIsRetrying(true);
    setCountdown(backoffSeconds);

    // Start countdown timer
    const intervalId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Wait for countdown to complete
    await new Promise(resolve => setTimeout(resolve, backoffSeconds * 1000));
    clearInterval(intervalId);
    
    setIsRetrying(false);
    resetErrorBoundary();
  };

  // Handle manual retry
  const handleManualRetry = () => {
    resetErrorBoundary();
  };

  // Navigate home
  const goHome = () => {
    window.location.href = '/';
  };

  // Determine message based on retry state
  const getMessage = () => {
    if (reachedMaxRetries) {
      return `We've tried ${maxRetries} times but couldn't resolve the issue.`;
    }
    
    if (retryCount > 0) {
      return `Attempt ${retryCount} of ${maxRetries} failed. Let's try again.`;
    }
    
    return "We encountered an unexpected error. Our team has been notified.";
  };

  return (
    <div className="p-6 rounded-lg border bg-background shadow-sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
        <p className="text-muted-foreground">{getMessage()}</p>
        
        {error && (
          <div className="w-full max-w-md bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-[150px]">
            <p className="font-semibold">{error.message}</p>
            {error.stack && (
              <pre className="mt-2 whitespace-pre-wrap text-[10px] overflow-auto">
                {error.stack.split('\n').slice(0, 5).join('\n')}
              </pre>
            )}
          </div>
        )}
        
        {isRetrying && (
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-xs">
              <span>Retrying in {countdown} seconds...</span>
              <span>{countdown > 0 ? `${Math.floor((countdown / (backoffSeconds || 1)) * 100)}%` : '100%'}</span>
            </div>
            <Progress value={100 - ((countdown / (backoffSeconds || 1)) * 100)} />
          </div>
        )}
        
        <div className="flex flex-wrap gap-3 justify-center">
          {!reachedMaxRetries && (
            <Button
              variant="default"
              onClick={handleManualRetry}
              disabled={isRetrying}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          
          {retryCount === 0 && !isRetrying && (
            <Button
              variant="outline"
              onClick={handleRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Auto Retry
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={goHome}
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
};

export default React.memo(ErrorFallback);
