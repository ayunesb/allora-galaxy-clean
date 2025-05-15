
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

interface RetryableErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
  resetKeys?: any[];
  onError?: (error: Error, info: { componentStack: string }) => void;
}

const RetryableErrorBoundary: React.FC<RetryableErrorBoundaryProps> = ({
  children,
  onReset,
  resetKeys,
  onError,
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={onReset}
      resetKeys={resetKeys}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default RetryableErrorBoundary;
