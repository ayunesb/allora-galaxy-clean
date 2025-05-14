
import React from 'react';
import { Loader2 } from 'lucide-react';
import ErrorState from '@/components/errors/ErrorState';
import { NoDataEmptyState } from '@/components/errors/EmptyStates';
import PartialErrorState from '@/components/errors/PartialErrorState';

interface DataStateHandlerProps<T> {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  data: T | null | undefined;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  onRetry?: () => void;
  isEmpty?: (data: T) => boolean;
}

/**
 * DataStateHandler - A component to handle different data states (loading, error, empty, success)
 */
export function DataStateHandler<T>({
  isLoading,
  isError,
  error,
  data,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  onRetry,
  isEmpty = (data: T) => {
    if (Array.isArray(data)) {
      return data.length === 0;
    }
    return data === null || data === undefined;
  },
}: DataStateHandlerProps<T>): React.ReactElement {
  // Handle loading state
  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return errorComponent ? (
      <>{errorComponent}</>
    ) : (
      <ErrorState
        title="Failed to load data"
        message="We couldn't load the requested data. Please try again later."
        error={error}
        retry={onRetry}
      />
    );
  }

  // Handle empty state
  if (!data || isEmpty(data)) {
    return emptyComponent ? (
      <>{emptyComponent}</>
    ) : (
      <NoDataEmptyState onRefresh={onRetry} />
    );
  }

  // Render children with data
  return <>{children(data)}</>;
}

interface PartialDataStateHandlerProps<T extends Record<string, any>> {
  data: Partial<T>;
  isLoading: boolean;
  errors: Record<string, Error | null>;
  completedQueries: string[];
  failedQueries: string[];
  children: (data: Partial<T>) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  retryQuery: (key: string) => Promise<any>;
}

/**
 * PartialDataStateHandler - A component to handle partial data loading with section-specific errors
 */
export function PartialDataStateHandler<T extends Record<string, any>>({
  data,
  isLoading,
  errors,
  completedQueries,
  failedQueries,
  children,
  loadingComponent,
  retryQuery,
}: PartialDataStateHandlerProps<T>): React.ReactElement {
  // Handle initial loading
  if (isLoading && completedQueries.length === 0) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show partial error state if some queries failed
  const showPartialError = failedQueries.length > 0;

  return (
    <>
      {showPartialError && (
        <PartialErrorState
          message={`Some data couldn't be loaded (${failedQueries.join(', ')}). You can still view available information.`}
          onRetry={() => Promise.all(failedQueries.map(key => retryQuery(key)))}
          variant="banner"
        />
      )}
      {children(data)}
    </>
  );
}
