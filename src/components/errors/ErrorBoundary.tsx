
import React from 'react';
import { ErrorBoundary as BaseErrorBoundary, FallbackProps } from './ErrorBoundaryBase';
import ErrorFallback from './ErrorFallback';
import { handleError } from '@/lib/errors/ErrorHandler';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  captureContext?: Record<string, any>;
  resetKeys?: any[];
}

/**
 * A simplified error boundary component that wraps the base implementation
 */
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback, 
  onReset,
  onError,
  captureContext = {},
  resetKeys
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log the error through the central error handling system
    handleError(error, {
      context: { 
        componentStack: errorInfo.componentStack,
        ...captureContext
      }
    }).catch(e => console.error('Failed to log error:', e));
    
    // Call custom handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  };
  
  return (
    <BaseErrorBoundary
      fallbackRender={({error, resetErrorBoundary}: FallbackProps) => {
        if (fallback) return <>{fallback}</>;
        return <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />;
      }}
      onReset={onReset}
      onError={handleError}
      resetKeys={resetKeys}
    >
      {children}
    </BaseErrorBoundary>
  );
};

export default ErrorBoundary;
