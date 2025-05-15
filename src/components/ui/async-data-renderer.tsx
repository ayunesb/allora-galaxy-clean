
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
}

export function AsyncDataRenderer<T>({
  data,
  isLoading,
  error,
  onRetry,
  renderData,
  children,
  loadingText = 'Loading data...',
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
    // If we have a retry function, render the RetryFeedback component
    if (onRetry) {
      return (
        <RetryFeedback
          retryCount={1}
          maxRetries={3}
          isRetrying={false}
          onRetry={onRetry}
          className="min-h-[200px]"
        />
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

  // Render data using the appropriate pattern
  if (renderData) {
    return renderData(data);
  }

  if (typeof children === 'function') {
    return <>{children(data)}</>;
  }

  return <>{children}</>;
}
