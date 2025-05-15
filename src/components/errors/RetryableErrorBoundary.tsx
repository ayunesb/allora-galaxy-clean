
import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

interface RetryableErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  maxRetries?: number;
}

interface ErrorInfo {
  componentStack: string;
}

const RetryableErrorBoundary: React.FC<RetryableErrorBoundaryProps> = ({
  children,
  onError,
  maxRetries = 3
}) => {
  const [retryCount, setRetryCount] = React.useState(0);

  const handleReset = React.useCallback(() => {
    setRetryCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount > maxRetries) {
        console.error(`Maximum retries (${maxRetries}) exceeded.`);
        return prevCount; // Don't increment beyond max
      }
      return newCount;
    });
  }, [maxRetries]);

  return (
    <ErrorBoundary
      FallbackComponent={(props: FallbackProps) => (
        <ErrorFallback
          error={props.error}
          resetErrorBoundary={props.resetErrorBoundary}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      )}
      onReset={handleReset}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
};

export const withRetryableErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RetryableErrorBoundaryProps, 'children'> = {}
): React.FC<P> => {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <RetryableErrorBoundary {...options}>
      <Component {...props} />
    </RetryableErrorBoundary>
  );
  
  WithErrorBoundary.displayName = `WithRetryableErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;
  
  return WithErrorBoundary;
};

export default RetryableErrorBoundary;
