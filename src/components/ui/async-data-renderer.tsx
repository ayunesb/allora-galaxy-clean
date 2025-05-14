
import React from 'react';
import { NoDataEmptyState } from '@/components/errors/EmptyStates';
import ErrorState from '@/components/ui/error-state';

interface AsyncDataRendererProps<T> {
  isLoading: boolean;
  error?: Error | null;
  data?: T | null;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  emptyMessage?: string;
  onRetry?: () => void;
  renderData: (data: T) => React.ReactNode;
  showEmptyState?: boolean;
  className?: string;
  preserveHeight?: boolean; // Added for compatibility
  loadingText?: string; // Added for compatibility
}

/**
 * A component that handles the async data flow states (loading, error, empty, data)
 */
export function AsyncDataRenderer<T>({
  isLoading,
  error,
  data,
  loadingComponent,
  errorComponent,
  emptyComponent,
  emptyMessage,
  onRetry,
  renderData,
  showEmptyState = true,
  className,
  preserveHeight = false, // Default value for new prop
  loadingText = "Loading...", // Default value for new prop
}: AsyncDataRendererProps<T>) {
  // Handle loading state
  if (isLoading) {
    if (loadingComponent) {
      return <div className={className}>{loadingComponent}</div>;
    }
    return (
      <div className={`flex justify-center items-center p-4 ${className}`}>
        <div className="flex flex-col items-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    if (errorComponent) {
      return <div className={className}>{errorComponent}</div>;
    }
    return (
      <ErrorState
        title="Error Loading Data"
        message="There was a problem loading the data."
        error={error}
        retry={onRetry}
        showDetails={true}
      />
    );
  }

  // Handle empty data state
  if ((!data || (Array.isArray(data) && data.length === 0)) && showEmptyState) {
    if (emptyComponent) {
      return <div className={className}>{emptyComponent}</div>;
    }
    return (
      <NoDataEmptyState
        message={emptyMessage || "No data available"}
        action={onRetry ? onRetry : undefined}
        actionText={onRetry ? "Refresh" : undefined}
      />
    );
  }

  // Render data
  return <div className={className}>{data ? renderData(data) : null}</div>;
}

interface PartialDataRendererProps<T> {
  isLoading: boolean;
  error?: Error | null;
  data?: T | null;
  fallbackData?: T;
  renderData: (data: T) => React.ReactNode;
  renderError?: (error: Error, retry?: () => void) => React.ReactNode;
  onRetry?: () => void;
  className?: string;
}

/**
 * A component that renders partial data even when errors occur
 */
export function PartialDataRenderer<T>({
  isLoading,
  error,
  data,
  fallbackData,
  renderData,
  renderError,
  onRetry,
  className,
}: PartialDataRendererProps<T>) {
  const dataToRender = data || fallbackData;

  return (
    <div className={className}>
      {/* Data part - render even with errors */}
      {dataToRender && renderData(dataToRender)}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-2 text-sm text-muted-foreground">Refreshing...</span>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mt-4">
          {renderError ? (
            renderError(error, onRetry)
          ) : (
            <div className="bg-destructive/10 rounded p-3 text-sm">
              <p className="font-medium text-destructive">Error</p>
              <p className="text-destructive/80">{error.message}</p>
              {onRetry && (
                <button 
                  className="mt-2 text-xs underline hover:no-underline"
                  onClick={onRetry}
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const DataStateHandler = AsyncDataRenderer;
export const PartialDataStateHandler = PartialDataRenderer;
