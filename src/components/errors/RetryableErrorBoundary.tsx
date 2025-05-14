
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
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
      fallbackRender={({ error, resetErrorBoundary }) => {
        if (fallback) {
          return <>{fallback}</>;
        }
        return (
          <ErrorFallback 
            error={error} 
            resetErrorBoundary={resetErrorBoundary}
            onError={(error) => {
              if (onError) {
                onError(error, { componentStack: '' });
              }
            }}
          />
        );
      }}
      onError={onError}
      onReset={onReset}
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundary>
  );
};

export default RetryableErrorBoundary;
