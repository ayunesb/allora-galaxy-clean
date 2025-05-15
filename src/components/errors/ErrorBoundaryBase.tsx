
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

interface ErrorBoundaryBaseProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, info: { componentStack: string }) => void;
  onReset?: () => void;
  resetKeys?: any[];
  showToast?: boolean;
  showLog?: boolean;
  title?: string;
  description?: string;
  logLevel?: 'info' | 'warning' | 'error';
  customMessage?: string;
  hideResetButton?: boolean;
}

/**
 * Base Error Boundary component that provides standard error handling behavior
 */
const ErrorBoundaryBase = ({
  children,
  fallback,
  onError,
  onReset,
  resetKeys,
  showToast = true,
  showLog = true,
  title,
  description,
  logLevel = 'error',
  customMessage,
  hideResetButton = false
}: ErrorBoundaryBaseProps) => {
  const handleError = (error: Error, info: { componentStack: string }) => {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', info.componentStack);
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, info);
    }
  };

  // Use custom fallback or default ErrorFallback
  const FallbackComponent = fallback || function DefaultFallback(props: FallbackProps) {
    return (
      <ErrorFallback
        error={props.error}
        resetErrorBoundary={props.resetErrorBoundary}
        showToast={showToast}
        showLog={showLog}
        title={title}
        description={description}
        customMessage={customMessage}
        logLevel={logLevel}
        hideResetButton={hideResetButton}
      />
    );
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={handleError}
      onReset={onReset}
      resetKeys={resetKeys}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundaryBase;
