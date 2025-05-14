
import React from 'react';
import { Card } from './card';
import ErrorState from './error-state';
import { Button } from './button';

interface AsyncDataRendererProps<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  renderData: (data: T) => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  renderError?: (error: Error, retry: (() => void) | undefined) => React.ReactNode;
  loadingText?: string;
  noDataText?: string;
  className?: string;
}

export function AsyncDataRenderer<T>({
  data,
  isLoading,
  error,
  onRetry,
  renderData,
  renderLoading,
  renderError,
  loadingText = 'Loading data...',
  noDataText = 'No data available',
  className = '',
}: AsyncDataRendererProps<T>) {
  const renderLoadingState = () => {
    if (renderLoading) {
      return renderLoading();
    }
    
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
          <p className="text-sm text-muted-foreground">{loadingText}</p>
        </div>
      </Card>
    );
  };

  const renderErrorState = (err: Error) => {
    if (renderError) {
      return renderError(err, onRetry);
    }
    
    return (
      <ErrorState
        title="Error loading data"
        description={err.message || 'An unexpected error occurred'}
        action={onRetry ? <Button onClick={onRetry}>Retry</Button> : undefined}
      />
    );
  };

  const renderNoData = () => {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground">{noDataText}</p>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState(error);
  }

  if (!data) {
    return renderNoData();
  }

  return <div className={className}>{renderData(data)}</div>;
}
