
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EdgeFunctionErrorDisplay } from '@/components/errors/EdgeFunctionErrorHandler';

interface WithEdgeFunctionErrorHandlingProps {
  isLoading?: boolean;
  error?: any;
  onRetry?: () => void;
  showDetails?: boolean;
  loadingElement?: React.ReactNode;
}

/**
 * Higher-order component to wrap any component with edge function error handling
 */
export function withEdgeFunctionErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    showDetails?: boolean;
    LoadingComponent?: React.ReactNode;
  } = {}
) {
  return function WithEdgeFunctionErrorHandling(
    props: P & WithEdgeFunctionErrorHandlingProps
  ) {
    const { 
      isLoading, 
      error, 
      onRetry, 
      showDetails = options.showDetails ?? false,
      loadingElement = options.LoadingComponent ?? <Skeleton className="w-full h-32" />,
      ...rest 
    } = props;
    
    if (isLoading) {
      return <>{loadingElement}</>;
    }
    
    if (error) {
      return (
        <EdgeFunctionErrorDisplay
          error={error}
          onRetry={onRetry}
          showDetails={showDetails}
        />
      );
    }
    
    return <Component {...rest as P} />;
  };
}

/**
 * Component that conditionally renders content or error state for edge function calls
 */
export const EdgeFunctionErrorHandler: React.FC<
  WithEdgeFunctionErrorHandlingProps & {
    children: React.ReactNode;
  }
> = ({ isLoading, error, children, onRetry, showDetails, loadingElement }) => {
  if (isLoading) {
    return <>{loadingElement || <Skeleton className="w-full h-32" />}</>;
  }
  
  if (error) {
    return (
      <EdgeFunctionErrorDisplay
        error={error}
        onRetry={onRetry}
        showDetails={showDetails}
      />
    );
  }
  
  return <>{children}</>;
};

export default withEdgeFunctionErrorHandling;
