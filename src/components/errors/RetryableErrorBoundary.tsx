
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ErrorFallback';
import { reportErrorFromErrorBoundary } from '@/lib/telemetry/errorReporter';

interface RetryableErrorBoundaryProps {
  children: React.ReactNode;
  maxRetries?: number;
  fallbackRender?: React.ComponentType<any>;
  componentName?: string;
  tenantId?: string;
  showDetails?: boolean;
  onReset?: () => void;
  onError?: (error: Error, info: { componentStack?: string }) => void;
}

/**
 * Enhanced error boundary with automatic retry capabilities
 * Uses react-error-boundary underneath for better handling
 */
const RetryableErrorBoundary: React.FC<RetryableErrorBoundaryProps> = ({
  children,
  maxRetries = 3,
  fallbackRender,
  componentName,
  tenantId,
  showDetails = false,
  onReset,
  onError
}) => {
  const [retryCount, setRetryCount] = React.useState(0);
  
  const handleReset = React.useCallback(() => {
    setRetryCount(prev => prev + 1);
    if (onReset) {
      onReset();
    }
  }, [onReset]);
  
  const handleError = React.useCallback((error: Error, info: { componentStack?: string }) => {
    // Report to telemetry system
    reportErrorFromErrorBoundary(error, info, {
      module: 'ui',
      tenantId,
      context: {
        componentName,
        retryCount
      }
    }).catch(reportingError => {
      console.error('Failed to report error:', reportingError);
    });
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, info);
    }
  }, [componentName, tenantId, retryCount, onError]);
  
  return (
    <ErrorBoundary
      FallbackComponent={fallbackRender || (props => (
        <ErrorFallback
          {...props}
          componentName={componentName}
          showDetails={showDetails}
          retryCount={retryCount}
          maxRetries={maxRetries}
          tenantId={tenantId}
        />
      ))}
      onReset={handleReset}
      onError={handleError}
      resetKeys={[retryCount]}
    >
      {children}
    </ErrorBoundary>
  );
};

export default RetryableErrorBoundary;
