
import React from "react";
import { ErrorState } from "./error-state";
import { Skeleton } from "./skeleton";

interface DataStateHandlerProps<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  onRetry?: () => void;
  isEmpty?: (data: T) => boolean;
  showLoadingStates?: boolean;
  loadingStateCount?: number;
}

/**
 * A component for handling loading, error, and empty states for data
 */
export function DataStateHandler<T>({
  data,
  isLoading,
  error,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  onRetry,
  isEmpty = (data: T) => Array.isArray(data) ? data.length === 0 : !data,
  showLoadingStates = true,
  loadingStateCount = 3
}: DataStateHandlerProps<T>) {
  // Loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    if (showLoadingStates) {
      return (
        <div className="space-y-4">
          {Array.from({ length: loadingStateCount }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  }
  
  // Error state
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    
    return (
      <ErrorState
        title="Failed to load data"
        message={error.message}
        retry={onRetry}
        error={error}
      />
    );
  }
  
  // Empty state
  if (!data || (data && isEmpty(data))) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  // Data state
  return <>{children(data)}</>;
}

interface PartialDataStateHandlerProps<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  children: (data: T | undefined) => React.ReactNode;
  errorComponent?: React.ReactNode;
  onRetry?: () => void;
  showError?: boolean;
}

/**
 * A data state handler that always renders children,
 * even when loading or on error, passing undefined if data isn't available
 */
export function PartialDataStateHandler<T>({
  data,
  isLoading,
  error,
  children,
  errorComponent,
  onRetry,
  showError = true
}: PartialDataStateHandlerProps<T>) {
  return (
    <>
      {error && showError && (
        errorComponent || (
          <div className="mb-4">
            <ErrorState
              title="Partial data error"
              message={error.message}
              retry={onRetry}
              size="sm"
            />
          </div>
        )
      )}
      {children(data)}
    </>
  );
}
