
import React from 'react';
import ErrorBoundaryBase from './ErrorBoundaryBase';
import ErrorFallback from './ErrorFallback';
import { reportErrorFromErrorBoundary } from '@/lib/telemetry/errorReporter';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: any[];
}

/**
 * ErrorBoundary component that catches errors in its child component tree
 * and displays a fallback UI when an error occurs.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  render() {
    const { children, fallback, onError, resetKeys } = this.props;
    
    // Handle error reporting using the central reporting system
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      // Report error to monitoring system
      reportErrorFromErrorBoundary(error, errorInfo, {
        module: 'ui'
      }).catch(console.error);
      
      // Call the provided onError handler if defined
      if (onError) {
        onError(error, errorInfo);
      }
    };
    
    return (
      <ErrorBoundaryBase
        fallback={({ error, resetErrorBoundary }) => (
          fallback || (
            <ErrorFallback
              error={error}
              resetErrorBoundary={resetErrorBoundary}
            />
          )
        )}
        onError={handleError}
        resetKeys={resetKeys}
      >
        {children}
      </ErrorBoundaryBase>
    );
  }
}

export default ErrorBoundary;
