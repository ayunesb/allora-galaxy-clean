
import React from 'react';
import { ErrorBoundary, ErrorBoundaryProps } from 'react-error-boundary';

/**
 * Interface for the RetryableErrorBoundary component
 */
interface RetryableErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'FallbackComponent'> {
  /**
   * Maximum number of retries before showing the fallback
   */
  maxRetries?: number;
  
  /**
   * Delay between retries in milliseconds
   */
  retryDelay?: number;
  
  /**
   * Whether to show a loading indicator during retries
   */
  showLoading?: boolean;
  
  /**
   * Component to show during retries
   */
  loadingComponent?: React.ReactNode;
  
  /**
   * FallbackComponent to show when max retries exceeded
   */
  FallbackComponent?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

/**
 * RetryableErrorBoundary - An error boundary that auto-retries before showing the fallback.
 * Useful for handling transient errors without interrupting the user experience.
 */
const RetryableErrorBoundary: React.FC<RetryableErrorBoundaryProps> = ({
  children,
  maxRetries = 3,
  retryDelay = 1000,
  showLoading = true,
  loadingComponent,
  FallbackComponent,
  ...props
}) => {
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  
  // Auto-reset the error boundary if maxRetries not exceeded
  const handleError = React.useCallback((error: Error, info: React.ErrorInfo) => {
    setError(error);
    
    if (retryCount < maxRetries) {
      setIsRetrying(true);
      
      // Retry after delay
      const timeoutId = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsRetrying(false);
        props.onReset?.();
      }, retryDelay);
      
      return () => clearTimeout(timeoutId);
    }
    
    // Call the original onError
    props.onError?.(error, {
      componentStack: info.componentStack
    });
  }, [retryCount, maxRetries, retryDelay, props]);
  
  // Reset the retry count when successfully rendered
  React.useEffect(() => {
    return () => {
      setRetryCount(0);
      setIsRetrying(false);
      setError(null);
    };
  }, [children]);
  
  if (isRetrying && showLoading) {
    return (
      <>
        {loadingComponent || (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </>
    );
  }
  
  return (
    <ErrorBoundary
      onError={handleError}
      FallbackComponent={FallbackComponent}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
};

export default RetryableErrorBoundary;

/**
 * Higher-order component to wrap a component with RetryableErrorBoundary
 */
export function withRetryableErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<RetryableErrorBoundaryProps, 'children'> = {}
) {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props: P) => {
    return (
      <RetryableErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </RetryableErrorBoundary>
    );
  };
  
  WrappedComponent.displayName = `withRetryableErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}
