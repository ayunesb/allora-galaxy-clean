
import React from 'react';
import { ErrorBoundary as BaseErrorBoundary } from './ErrorBoundaryBase';
import ErrorFallback from './ErrorFallback';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

/**
 * A simplified error boundary component that wraps the base implementation
 */
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback, onReset }) => {
  return (
    <BaseErrorBoundary
      fallbackRender={({error, resetErrorBoundary}) => {
        if (fallback) return <>{fallback}</>;
        return <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />;
      }}
      onReset={onReset}
      onError={(error, errorInfo) => {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }}
    >
      {children}
    </BaseErrorBoundary>
  );
};

export default ErrorBoundary;
