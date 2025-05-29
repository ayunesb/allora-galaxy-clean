import React, { Suspense, useState, useEffect } from "react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import CardErrorState from "@/components/errors/CardErrorState";

interface LazyLoadingWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorComponent?: React.ReactNode;
  loadingText?: string;
  timeout?: number; // Timeout in milliseconds
}

/**
 * Wrapper component for lazy-loaded components with error handling and timeout
 */
const LazyLoadingWrapper: React.FC<LazyLoadingWrapperProps> = ({
  children,
  fallback,
  errorComponent,
  loadingText = "Loading...",
  timeout = 10000, // Default timeout of 10 seconds
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setHasTimedOut(true);
    }, timeout);

    return () => clearTimeout(timerId);
  }, [timeout]);

  if (hasTimedOut) {
    return (
      errorComponent || (
        <CardErrorState
          title="Loading Timeout"
          message="This component took too long to load. Please try again."
          onRetry={() => window.location.reload()}
        />
      )
    );
  }

  return (
    <Suspense fallback={fallback || <LoadingIndicator text={loadingText} />}>
      {children}
    </Suspense>
  );
};

export default React.memo(LazyLoadingWrapper);
