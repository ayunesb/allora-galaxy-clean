
import React, { memo } from 'react';
import { LoadingIndicator } from './loading-spinner';
import ErrorState from './error-state';
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
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  showDetails?: boolean;
  loadingSize?: 'sm' | 'md' | 'lg' | 'xl';
  loadingClassName?: string;
}

/**
 * Renders data with proper loading, error, and retry states
 * 
 * @template T The type of data being rendered
 */
function AsyncDataRenderer<T>({
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
  fallback,
  loadingFallback,
  errorFallback,
  showDetails = false,
  loadingSize = 'md',
  loadingClassName,
}: AsyncDataRendererProps<T>) {
  // Render custom fallback if provided
  if (fallback && (isLoading || error || !data)) {
    return <>{fallback}</>;
  }
  
  // Render loading state
  if (isLoading) {
    if (loadingFallback) {
      return <>{loadingFallback}</>;
    }
    
    return (
      <div className="flex justify-center items-center p-8 min-h-[200px]">
        <LoadingIndicator 
          size={loadingSize} 
          text={loadingText} 
          className={loadingClassName}
        />
      </div>
    );
  }

  // Render error state
  if (error) {
    // Use custom error fallback if provided
    if (errorFallback) {
      return <>{errorFallback}</>;
    }
    
    // If we have a retry function and retry information is provided, render the RetryFeedback component
    return (
      <>
        {onRetry && (retryCount > 0 || isRetrying) && (
          <RetryFeedback
            retryCount={retryCount}
            maxRetries={maxRetries}
            isRetrying={isRetrying}
            onRetry={onRetry}
            className="mb-4"
          />
        )}
        <ErrorState
          title="Failed to load data"
          message={error.message}
          error={error}
          showDetails={showDetails}
          retry={onRetry}
        />
      </>
    );
  }

  // Render empty state
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

// Export memoized component for performance optimization
export default memo(AsyncDataRenderer) as typeof AsyncDataRenderer;
