
import React, { useState, useCallback } from 'react';
import { EdgeFunctionHandler } from './EdgeFunctionHandler';
import { reportApiError } from '@/lib/telemetry/errorReporter';

export interface WithEdgeFunctionErrorHandlingProps {
  functionName?: string;
  showDetails?: boolean;
  maxRetries?: number;
  autoRetry?: boolean;
}

/**
 * Higher-order component that adds edge function error handling
 */
export function withEdgeFunctionErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  options: WithEdgeFunctionErrorHandlingProps = {}
): React.FC<P> {
  const {
    functionName = 'unknown',
    showDetails = false,
    maxRetries = 3,
    autoRetry = false
  } = options;
  
  const WithErrorHandling = (props: P) => {
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    
    const handleError = useCallback((error: Error) => {
      setError(error);
      reportApiError(functionName, error, undefined, {
        context: {
          retryCount,
          component: Component.displayName || Component.name || 'Component'
        }
      }).catch(console.error);
      setIsLoading(false);
    }, [retryCount]);
    
    const clearError = useCallback(() => {
      setError(null);
    }, []);
    
    const handleRetry = useCallback(() => {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setError(null);
      }
    }, [retryCount, maxRetries]);
    
    const setLoading = useCallback((loading: boolean) => {
      setIsLoading(loading);
      if (!loading) {
        // Clear error when loading completes successfully
        setError(null);
      }
    }, []);
    
    // Enhanced props with error handling capabilities
    const enhancedProps = {
      ...props,
      error,
      isLoading,
      retryCount,
      handleError,
      clearError,
      handleRetry,
      setLoading
    };
    
    return (
      <EdgeFunctionHandler
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        showDetails={showDetails}
        retryCount={retryCount}
        maxRetries={maxRetries}
        functionName={functionName}
        autoRetry={autoRetry}
      >
        <Component {...enhancedProps as P} />
      </EdgeFunctionHandler>
    );
  };
  
  // Set display name for debugging
  const componentName = Component.displayName || Component.name || 'Component';
  WithErrorHandling.displayName = `withEdgeFunctionErrorHandling(${componentName})`;
  
  return WithErrorHandling;
}
