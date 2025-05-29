import React, { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface OptimizedAsyncDataRendererProps<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => Promise<unknown>;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  virtualize?: boolean;
  height?: string | number;
  retryCount?: number;
  maxRetries?: number;
  loadingText?: string;
  showDetails?: boolean;
}

function OptimizedAsyncDataRenderer<T>({
  data,
  isLoading,
  error,
  onRetry,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  virtualize = false,
  height = "400px",
  retryCount = 0,
  maxRetries = 3,
  loadingText = "Loading...",
  showDetails = false,
}: OptimizedAsyncDataRendererProps<T>) {
  // Memoized retry handler
  const handleRetry = useCallback(async () => {
    if (onRetry) {
      await onRetry();
    }
  }, [onRetry]);

  // Default loading component
  const defaultLoadingComponent = (
    <div className="flex justify-center items-center p-8">
      <LoadingIndicator size="md" text={loadingText} />
    </div>
  );

  // Default error component
  const defaultErrorComponent = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-2" />
      <h3 className="text-lg font-medium mb-2">Failed to load data</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {error?.message || "An error occurred while fetching data."}
      </p>
      {showDetails && error?.stack && (
        <div className="max-w-full overflow-auto text-left bg-muted p-2 rounded text-xs mb-4">
          <pre>{error.stack}</pre>
        </div>
      )}
      {onRetry && (
        <div>
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={retryCount >= maxRetries}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {retryCount >= maxRetries ? "Max retries reached" : "Retry"}
          </Button>
          {retryCount > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Attempt {retryCount} of {maxRetries}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // Default empty component
  const defaultEmptyComponent = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-muted-foreground">No data available</p>
    </div>
  );

  if (isLoading) {
    return loadingComponent || defaultLoadingComponent;
  }

  if (error) {
    return errorComponent || defaultErrorComponent;
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return emptyComponent || defaultEmptyComponent;
  }

  // Render virtualized content inside a ScrollArea when virtualize is true
  if (virtualize && Array.isArray(data)) {
    return <ScrollArea style={{ height }}>{children(data)}</ScrollArea>;
  }

  return <>{children(data)}</>;
}

// Memoize the component to prevent unnecessary re-renders
const MemoizedOptimizedAsyncDataRenderer = memo(
  OptimizedAsyncDataRenderer,
) as typeof OptimizedAsyncDataRenderer;
export default MemoizedOptimizedAsyncDataRenderer;
export { OptimizedAsyncDataRenderer };
