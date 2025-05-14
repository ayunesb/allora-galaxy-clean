import React from 'react';
import { LoadingSpinner } from './loading-spinner';
import { ErrorState } from './error-state';
import { RetryFeedback } from './retry-feedback';

export interface AsyncDataRendererProps<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  renderData: (data: T) => React.ReactElement;
  loadingText?: string;
}

export function AsyncDataRenderer<T>({
  data,
  isLoading,
  error,
  onRetry,
  renderData,
  loadingText = 'Loading data...',
}: AsyncDataRendererProps<T>) {
  // Render states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-[200px]">
        <LoadingSpinner message={loadingText} />
      </div>
    );
  }

  if (error) {
    // If we have a retry function, render the RetryFeedback component
    if (onRetry) {
      return (
        <RetryFeedback
          error={error}
          onRetry={onRetry}
          className="min-h-[200px]"
        />
      );
    }
    
    // Otherwise render the standard error state
    return (
      <ErrorState
        title="Failed to load data"
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

  return renderData(data);
}
