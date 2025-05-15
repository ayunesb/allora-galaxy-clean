
import React from "react";
import { ErrorState } from "./error-state";
import { LoadingSpinner } from "./loading-spinner";

export interface AsyncDataRendererProps<T> {
  data: T | undefined;
  isLoading: boolean;
  error?: Error | unknown;
  onRetry?: () => void;
  emptyState?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}

export function AsyncDataRenderer<T>({
  data,
  isLoading,
  error,
  onRetry,
  emptyState,
  loadingComponent,
  errorComponent,
  children,
}: AsyncDataRendererProps<T>) {
  // Show loading state
  if (isLoading) {
    return loadingComponent || (
      <div className="w-full flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state
  if (error) {
    return errorComponent || (
      <ErrorState
        error={error as Error}
        onRetry={onRetry}
      />
    );
  }

  // Show empty state
  if (!data) {
    return emptyState || (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  // Render children with data
  return <>{children(data)}</>;
}

export type { AsyncDataRendererProps };
