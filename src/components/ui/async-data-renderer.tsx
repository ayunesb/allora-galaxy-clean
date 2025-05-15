
import React from 'react';
import { LoadingSpinner } from './loading-spinner';
import { ErrorState } from './error-state';
import RetryFeedback from './retry-feedback';

export interface AsyncDataRendererProps<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  renderData?: (data: T) => React.ReactElement;
  children?: React.ReactNode | ((data: T) => React.ReactNode);
  loadingText?: string;
  retryCount?: number;
  maxRetries?: number;
  isRetrying?: boolean;
}

export function AsyncDataRenderer<T>({
  data,
  isLoading,
  error,
  onRetry,
  renderData,
  children,
  loadingText = 'Loading data...',
  retryCount = 0,
  maxRetries = 3,
  isRetrying = false,
}: AsyncDataRendererProps<T>) {
  // Render states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-[200px]">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="md" />
          <p className="mt-2 text-sm text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    );
  }

  if (error) {
    // If we have a retry function and retry information is provided, render the RetryFeedback component
    if (onRetry && (retryCount > 0 || isRetrying)) {
      return (
        <>
          <RetryFeedback
            retryCount={retryCount}
            maxRetries={maxRetries}
            isRetrying={isRetrying}
            onRetry={onRetry}
            className="mb-4"
          />
          <ErrorState
            title="Failed to load data"
            message={error.message}
            action={
              onRetry ? (
                <button
                  onClick={onRetry}
                  className="text-primary hover:underline"
                >
                  Try again
                </button>
              ) : undefined
            }
          />
        </>
      );
    }
    
    // Otherwise render the standard error state
    return (
      <ErrorState
        title="Failed to load data"
        message={error.message}
        action={
          onRetry ? (
            <button
              onClick={onRetry}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          ) : undefined
        }
      />
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No data available.
      </div>
    );
  }

  // Render data using the appropriate pattern:
  // 1. If renderData function is provided, use it
  if (renderData) {
    return renderData(data);
  }

  // 2. If children is a function, call it with the data
  if (typeof children === 'function') {
    return <>{children(data)}</>;
  }

  // 3. Otherwise just render children
  return <>{children}</>;
}

export default AsyncDataRenderer;
