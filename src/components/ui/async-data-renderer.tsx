
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AsyncDataRendererProps<T> {
  /** Data being loaded */
  data: T | undefined;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Any error that occurred during loading */
  error: Error | null;
  /** Function to retry loading data */
  onRetry?: () => void;
  /** Component to render when data is loaded successfully */
  children: (data: T) => React.ReactNode;
  /** Optional component to render when loading */
  loadingComponent?: React.ReactNode;
  /** Optional component to render when error occurs */
  errorComponent?: React.ReactNode;
  /** Optional component to render when no data */
  emptyComponent?: React.ReactNode;
  /** Whether to show skeleton while loading */
  showSkeleton?: boolean;
}

/**
 * A component to handle async data loading states
 * Renders different UI based on loading state
 */
export function AsyncDataRenderer<T>({
  data,
  isLoading,
  error,
  onRetry,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  showSkeleton = true,
}: AsyncDataRendererProps<T>) {
  // Handle loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    if (showSkeleton) {
      return (
        <div className="w-full space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }
    
    return <div className="py-4 text-center text-muted-foreground">Loading...</div>;
  }

  // Handle error state
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading data</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{error.message || 'An unexpected error occurred'}</p>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry} 
              className="w-fit flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" /> Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Handle empty data state
  if (!data || (Array.isArray(data) && data.length === 0)) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    return <div className="py-4 text-center text-muted-foreground">No data available</div>;
  }

  // Render children with data
  return <>{children(data)}</>;
}

export default AsyncDataRenderer;
