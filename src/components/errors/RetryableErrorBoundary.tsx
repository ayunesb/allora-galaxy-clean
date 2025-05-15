
import React, { useState, useCallback, memo } from 'react';
import ErrorFallback from '@/components/ErrorFallback';
import { ErrorBoundary } from 'react-error-boundary';
import { reportErrorFromErrorBoundary } from '@/lib/telemetry/errorReporter';

export interface RetryableErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
  onReset?: () => void;
  maxRetries?: number;
  FallbackComponent?: React.ComponentType<any>;
}

/**
 * Enhanced error boundary with retry capability and telemetry integration
 */
const RetryableErrorBoundary: React.FC<RetryableErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  onReset,
  maxRetries = 3,
  FallbackComponent = ErrorFallback
}) => {
  const [retryCount, setRetryCount] = useState(0);

  const handleError = useCallback((error: Error, info: { componentStack: string }) => {
    // Report error to telemetry system
    reportErrorFromErrorBoundary(error, info, {
      context: { retryCount }
    }).catch(reportError => {
      console.error('Failed to report error to telemetry:', reportError);
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, info);
    }
  }, [onError, retryCount]);

  const handleReset = useCallback(() => {
    setRetryCount(count => count + 1);
    if (onReset) {
      onReset();
    }
  }, [onReset]);

  // If we've exceeded max retries, show a different message
  const renderFallback = useCallback((props: any) => {
    if (retryCount >= maxRetries) {
      return (
        <FallbackComponent
          {...props}
          reachedMaxRetries={true}
          maxRetries={maxRetries}
          resetErrorBoundary={() => {
            setRetryCount(0);
            props.resetErrorBoundary();
          }}
        />
      );
    }
    return fallback || <FallbackComponent {...props} retryCount={retryCount} />;
  }, [fallback, retryCount, maxRetries, FallbackComponent]);

  return (
    <ErrorBoundary
      FallbackComponent={renderFallback}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * HOC for wrapping components with a retryable error boundary
 */
export function withRetryableErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RetryableErrorBoundaryProps, 'children'> = {}
): React.FC<P> {
  const WrappedComponent = (props: P) => (
    <RetryableErrorBoundary {...options}>
      <Component {...props} />
    </RetryableErrorBoundary>
  );

  WrappedComponent.displayName = `withRetryableErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}

// Memoize the component for performance
export default memo(RetryableErrorBoundary);
