import React, { useCallback } from "react";
import {
  ErrorBoundary as ReactErrorBoundary,
  type FallbackProps,
} from "react-error-boundary";
import ErrorFallback from "./ErrorFallback";

interface ErrorBoundaryBaseProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: any[];
  showToast?: boolean;
  showLog?: boolean;
  title?: string;
  description?: string;
  logLevel?: "info" | "warning" | "error";
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
  logLevel = "error",
  customMessage,
  hideResetButton = false,
}: ErrorBoundaryBaseProps) => {
  // Memoize the error handler to avoid recreating it on every render
  const handleError = useCallback(
    (error: Error, info: React.ErrorInfo) => {
      // Log the error to console
      console.error("Error caught by ErrorBoundary:", error);
      console.error("Component stack:", info.componentStack);

      // Call custom error handler if provided
      if (onError) {
        onError(error, info);
      }
    },
    [onError],
  );

  // Use custom fallback or default ErrorFallback - memoize this to avoid recreating on every render
  const FallbackComponent =
    fallback ||
    function DefaultFallback(props: FallbackProps) {
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

// Use memo to prevent unnecessary re-renders
export default React.memo(ErrorBoundaryBase);
