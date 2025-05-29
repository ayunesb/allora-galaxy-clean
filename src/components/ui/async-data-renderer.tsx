import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export interface AsyncDataRendererProps<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => Promise<any>;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

// Ensure DataStateHandlerProps supports renderData
export interface DataStateHandlerProps<T> {
  isLoading: boolean;
  loadingComponent: JSX.Element;
  data: T[];
  renderData?: () => JSX.Element;
}

export function AsyncDataRenderer<T>({
  data,
  isLoading,
  error,
  onRetry,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
}: AsyncDataRendererProps<T>) {
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex justify-center items-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin opacity-50" />
        </div>
      )
    );
  }

  if (error) {
    return (
      errorComponent || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-2" />
          <h3 className="text-lg font-medium mb-2">Failed to load data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || "An error occurred while fetching data."}
          </p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      )
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      emptyComponent || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      )
    );
  }

  return <>{children(data)}</>;
}

export default AsyncDataRenderer;
