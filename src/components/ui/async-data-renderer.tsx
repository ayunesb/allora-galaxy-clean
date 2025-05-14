
import React from 'react';
import { LoadingIndicator } from './loading-indicator';
import ErrorState from '@/components/errors/ErrorState';
import { NoDataEmptyState } from '@/components/errors/EmptyStates';
import RetryFeedback from '@/components/ui/retry-feedback';
import { cn } from '@/lib/utils';

export interface AsyncDataRendererProps<T> {
  data: T | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  loadingText?: string;
  errorTitle?: string;
  errorMessage?: string;
  emptyMessage?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
  isRetrying?: boolean;
  className?: string;
  loadingSize?: 'sm' | 'md' | 'lg' | 'xl';
  preserveHeight?: boolean;
}

/**
 * AsyncDataRenderer - A component to handle loading, error, and empty states consistently
 */
export function AsyncDataRenderer<T>({
  data,
  isLoading,
  isError,
  error,
  isEmpty = (data: T) => {
    if (data === null || data === undefined) return true;
    if (Array.isArray(data)) return data.length === 0;
    if (typeof data === 'object') return Object.keys(data).length === 0;
    return false;
  },
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  loadingText = "Loading...",
  errorTitle,
  errorMessage,
  emptyMessage,
  showDetails = false,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  isRetrying = false,
  className,
  loadingSize = 'md',
  preserveHeight = false,
}: AsyncDataRendererProps<T>): React.ReactElement {
  // Get container ref for preserving height
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState<number | null>(null);

  // Update containerHeight when component mounts or data changes from loading to success
  React.useEffect(() => {
    if (preserveHeight && containerRef.current && !isLoading && data && !isError) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
  }, [preserveHeight, isLoading, data, isError]);

  const containerStyle = preserveHeight && containerHeight 
    ? { minHeight: `${containerHeight}px` } 
    : {};

  // Handle loading state
  if (isLoading) {
    return (
      <div className={cn("relative", className)} style={containerStyle}>
        {loadingComponent || (
          <LoadingIndicator text={loadingText} size={loadingSize} />
        )}
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className={cn("relative", className)} style={containerStyle}>
        {errorComponent || (
          <>
            {(retryCount > 0 || isRetrying) && onRetry && (
              <RetryFeedback
                retryCount={retryCount}
                maxRetries={maxRetries}
                isRetrying={isRetrying}
                onRetry={onRetry}
                className="mb-4"
              />
            )}
            <ErrorState
              title={errorTitle || "Failed to load data"}
              message={errorMessage || "We couldn't load the requested data."}
              error={error || undefined}
              retry={onRetry}
              showDetails={showDetails}
            />
          </>
        )}
      </div>
    );
  }

  // Handle empty state
  if (!data || isEmpty(data)) {
    return (
      <div className={cn("relative", className)} style={containerStyle}>
        {emptyComponent || (
          <NoDataEmptyState 
            onRefresh={onRetry} 
            customMessage={emptyMessage} 
          />
        )}
      </div>
    );
  }

  // Render children with data
  return (
    <div className={className} ref={containerRef} style={containerStyle}>
      {children(data)}
    </div>
  );
}

export default AsyncDataRenderer;
