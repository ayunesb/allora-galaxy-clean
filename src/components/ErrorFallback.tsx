
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  componentStack?: string;
  tenantId?: string;
  componentName?: string;
  showDetails?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Default error fallback component for error boundaries
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  componentStack,
  componentName,
  showDetails = false,
  retryCount = 0,
  maxRetries = 3
}) => {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);

  const canRetry = retryCount < maxRetries && typeof resetErrorBoundary === 'function';
  
  // Reset with exponential backoff
  const handleRetry = React.useCallback(() => {
    if (!resetErrorBoundary) return;
    
    setIsRetrying(true);
    
    // Calculate backoff time with exponential increase 
    const backoffSeconds = Math.min(Math.pow(2, retryCount), 30);
    setCountdown(backoffSeconds);
    
    // Update countdown timer
    const intervalId = setInterval(() => {
      setCountdown(prev => {
        const newVal = prev - 1;
        if (newVal <= 0) {
          clearInterval(intervalId);
          setIsRetrying(false);
          resetErrorBoundary();
        }
        return newVal;
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [resetErrorBoundary, retryCount]);
  
  // Attempt to report error
  React.useEffect(() => {
    try {
      // Report error to monitoring system if available
      if (typeof window !== 'undefined' && 'reportError' in window) {
        (window as any).reportError(error, {
          source: 'react_error_boundary',
          componentName,
          componentStack: componentStack || '',
          tenant_id: tenantId
        });
      }
    } catch (reportingError) {
      console.error('Failed to report error to monitoring system:', reportingError);
    }
  }, [error, componentStack, componentName, tenantId]);

  return (
    <div className="p-4 border border-destructive/20 rounded-md bg-destructive/5 flex flex-col items-center text-center space-y-4">
      <div className="flex items-center justify-center space-x-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <h3 className="font-medium">
          {componentName ? `Error in ${componentName}` : 'Something went wrong'}
        </h3>
      </div>
      
      <p className="text-sm text-muted-foreground max-w-md">
        {error.message || 'An unexpected error occurred'}
      </p>
      
      {showDetails && error.stack && (
        <details className="text-left w-full">
          <summary className="text-xs text-muted-foreground cursor-pointer">
            Error details
          </summary>
          <pre className="mt-2 p-2 bg-muted text-xs rounded-sm overflow-auto max-h-40">
            {error.stack}
          </pre>
        </details>
      )}
      
      {canRetry && (
        <div className="flex flex-col items-center space-y-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry} 
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                Retrying in {countdown}s
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3" />
                {retryCount > 0 ? `Retry (${retryCount + 1}/${maxRetries})` : "Try again"}
              </>
            )}
          </Button>
          
          {retryCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {retryCount === maxRetries - 1 
                ? 'Final retry attempt' 
                : `Attempt ${retryCount + 1} of ${maxRetries}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorFallback;
