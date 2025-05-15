import React, { useState, useCallback, memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { reportErrorFromErrorBoundary } from '@/lib/telemetry/errorReporter';
import ErrorFallback from './ErrorFallback';

export interface RetryableErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
  onReset?: () => void;
  maxRetries?: number;
  FallbackComponent?: React.ComponentType<any>;
  resetKeys?: any[];
}

/**
 * Enhanced error boundary with retry capability and telemetry integration
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {React.ReactNode} [props.fallback] - Custom fallback UI when error occurs
 * @param {Function} [props.onError] - Handler for when an error occurs
 * @param {Function} [props.onReset] - Handler for when the error boundary is reset
 * @param {number} [props.maxRetries=3] - Maximum number of retries allowed
 * @param {React.ComponentType} [props.FallbackComponent] - Custom fallback component
 * @param {Array<any>} [props.resetKeys] - Dependencies that will reset the error boundary when changed
 */
const RetryableErrorBoundary: React.FC<RetryableErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  onReset,
  maxRetries = 3,
  FallbackComponent,
  resetKeys = []
}) => {
  const [retryCount, setRetryCount] = useState(0);
  
  // Handle errors by reporting to telemetry system
  const handleError = useCallback((error: Error, info: { componentStack: string }) => {
    // Report error to telemetry system
    reportErrorFromErrorBoundary(error, info, {
      context: {
        retryCount,
        maxRetries,
        componentStack: info.componentStack
      }
    }).catch(reportError => {
      console.error('Failed to report error from error boundary:', reportError);
    });
    
    // Call custom handler if provided
    if (onError) {
      onError(error, info);
    }
  }, [onError, retryCount, maxRetries]);
  
  // Handle reset and retry
  const handleReset = useCallback(() => {
    setRetryCount(count => {
      const newCount = count + 1;
      
      // Call custom reset handler if provided
      if (onReset) {
        onReset();
      }
      
      return newCount;
    });
  }, [onReset]);
  
  // Define Fallback component with retry count
  const FallbackWithRetry = useCallback((props: any) => {
    const ResolvedFallback = FallbackComponent || ErrorFallback;
    
    if (retryCount >= maxRetries) {
      // If max retries reached and custom fallback provided, use that
      if (fallback) {
        return <>{fallback}</>;
      }
      
      // Otherwise use FallbackComponent with retry disabled
      return (
        <ResolvedFallback
          {...props}
          retryCount={retryCount}
          maxRetries={maxRetries}
          retryExhausted={true}
        />
      );
    }
    
    // Normal case: render fallback with retry capability
    return (
      <ResolvedFallback
        {...props}
        retryCount={retryCount}
        maxRetries={maxRetries}
      />
    );
  }, [FallbackComponent, retryCount, maxRetries, fallback]);

  return (
    <ErrorBoundary
      FallbackComponent={FallbackWithRetry}
      onError={handleError}
      onReset={handleReset}
      resetKeys={[...resetKeys, retryCount]}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * HOC to wrap components with RetryableErrorBoundary
 * 
 * @param {React.ComponentType<P>} Component - Component to wrap
 * @param {Object} options - Error boundary configuration
 * @returns {React.FC<P>} Wrapped component with error boundary
 */
export function withRetryableErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RetryableErrorBoundaryProps, 'children'> = {}
) {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <RetryableErrorBoundary {...options}>
      <Component {...props} />
    </RetryableErrorBoundary>
  );
  
  WithErrorBoundary.displayName = `WithRetryableErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;
  
  return WithErrorBoundary;
}

export default memo(RetryableErrorBoundary);
