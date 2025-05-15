
import React, { useState, useEffect } from 'react';
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

    const handleEdgeFunctionError = (err: Error) => {
      console.error('Edge function error caught by HOC:', err);
      
      // Show toast notification
      toast.error({
        title: 'Edge Function Error',
        description: err.message || 'An error occurred in the edge function'
      });
      
      // Set the error state to trigger error display
      setError(err);
    };

    // Reset error if props change
    useEffect(() => {
      setError(null);
    }, [props]);

    if (error) {
      return <EdgeFunctionErrorDisplay error={error} onRetry={() => setError(null)} />;
    }

    return <WrappedComponent {...props} onEdgeFunctionError={handleEdgeFunctionError} />;
  };

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithEdgeFunctionErrorHandling.displayName = `withEdgeFunctionErrorHandling(${displayName})`;

  return WithEdgeFunctionErrorHandling;
};

export default withEdgeFunctionErrorHandling;
