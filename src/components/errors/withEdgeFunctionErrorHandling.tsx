
import React, { useState, useEffect, useCallback, memo } from 'react';
import EdgeFunctionErrorDisplay from './EdgeFunctionErrorDisplay';
import { toast } from '@/lib/notifications/toast';

interface WithEdgeFunctionErrorHandlingProps {
  onEdgeFunctionError?: (err: Error) => void;
}

/**
 * Higher-order component that adds edge function error handling
 * @param WrappedComponent The component to wrap with error handling
 */
const withEdgeFunctionErrorHandling = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithEdgeFunctionErrorHandlingProps>
): React.FC<P> => {
  const WithEdgeFunctionErrorHandling: React.FC<P> = (props) => {
    const [error, setError] = useState<Error | null>(null);

    // Memoize error handler to prevent recreation on each render
    const handleEdgeFunctionError = useCallback((err: Error) => {
      console.error('Edge function error caught by HOC:', err);
      
      // Show toast notification
      toast.error({
        title: 'Edge Function Error',
        description: err.message || 'An error occurred in the edge function'
      });
      
      // Set the error state to trigger error display
      setError(err);
    }, []);

    // Reset error if props change - memoize the deps array
    const propsSignature = JSON.stringify(props);
    useEffect(() => {
      setError(null);
    }, [propsSignature]);

    // Memoize the error display component to prevent unnecessary re-renders
    const ErrorComponent = useMemo(() => {
      if (!error) return null;
      return <EdgeFunctionErrorDisplay error={error} onRetry={() => setError(null)} />;
    }, [error]);

    if (error) {
      return ErrorComponent;
    }

    return <WrappedComponent {...props} onEdgeFunctionError={handleEdgeFunctionError} />;
  };

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithEdgeFunctionErrorHandling.displayName = `withEdgeFunctionErrorHandling(${displayName})`;

  // Use memo to prevent unnecessary re-renders of the HOC itself
  return memo(WithEdgeFunctionErrorHandling);
};

export default withEdgeFunctionErrorHandling;
