
import React from 'react';
import { ErrorBoundary, FallbackProps } from '@/components/errors/ErrorBoundaryBase';
import { ErrorFallback } from './ErrorFallback';

export type RetryableErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
  onReset?: () => void;
  resetKeys?: any[];
};

/**
 * Error boundary that provides retry functionality
 */
const RetryableErrorBoundary: React.FC<RetryableErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  onReset,
  resetKeys = [],
}) => {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }: FallbackProps) => {
        if (fallback) {
          return <>{fallback}</>;
        }
        return (
          <ErrorFallback 
            error={error} 
            resetErrorBoundary={resetErrorBoundary}
          />
        );
      }}
      onError={(error, info) => {
        if (onError) {
          onError(error, info);
        }
      }}
      onReset={onReset}
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Higher-order component to wrap a component with a retryable error boundary
 */
export function withRetryableErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<RetryableErrorBoundaryProps, 'children'> = {}
): React.FC<P> {
  return (props: P) => (
    <RetryableErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </RetryableErrorBoundary>
  );
}

export default RetryableErrorBoundary;
