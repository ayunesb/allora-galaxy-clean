
import { useState, useEffect, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { NetworkError, TimeoutError } from './errorTypes';

interface UseDataFetchingOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: any[];
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  autoLoad?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: Error, retryCount: number) => boolean;
  tenantId?: string;
  module?: string;
}

/**
 * Hook for handling data fetching with retries and error handling
 */
export function useDataFetching<T>({
  fetchFn,
  dependencies = [],
  initialData,
  onSuccess,
  onError,
  autoLoad = true,
  retryOnError = true,
  maxRetries = 3,
  retryDelay = 1000,
  shouldRetry,
  tenantId = 'system',
  module = 'data',
}: UseDataFetchingOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeoutId, setRetryTimeoutId] = useState<number | null>(null);
  
  const { error, handleError, clearError } = useErrorHandler<Error>({
    tenantId,
    module,
    showNotification: false, // We'll handle notifications manually
  });
  
  // Default shouldRetry function
  const defaultShouldRetry = useCallback((error: Error, retryCount: number) => {
    // Only retry on network or timeout errors
    return (
      retryOnError &&
      retryCount < maxRetries &&
      (error instanceof NetworkError || error instanceof TimeoutError)
    );
  }, [retryOnError, maxRetries]);
  
  // The actual retry function
  const shouldRetryFn = shouldRetry || defaultShouldRetry;
  
  // Clear any pending retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutId !== null) {
        clearTimeout(retryTimeoutId);
      }
    };
  }, [retryTimeoutId]);
  
  // The fetch function with retry logic
  const fetchData = useCallback(async (manuallyTriggered = false) => {
    // Clear any existing errors
    clearError();
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Execute the fetch function
      const result = await fetchFn();
      
      // Update state with result
      setData(result);
      setRetryCount(0);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err: any) {
      // Handle the error
      const alloraError = await handleError(err, {
        context: {
          retryCount,
          manuallyTriggered,
        },
      });
      
      // Call error callback if provided
      if (onError) {
        onError(err);
      }
      
      // Determine if we should retry
      if (shouldRetryFn(err, retryCount)) {
        // Calculate retry delay with exponential backoff
        const delay = retryDelay * Math.pow(2, retryCount);
        
        // Set up retry
        const timeoutId = window.setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          setRetryTimeoutId(null);
          fetchData(false);
        }, delay);
        
        // Save timeout ID for cleanup
        setRetryTimeoutId(timeoutId);
      }
      
      throw alloraError;
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchFn,
    retryCount,
    retryDelay,
    shouldRetryFn,
    onSuccess,
    onError,
    handleError,
    clearError,
  ]);
  
  // Auto-fetch data when dependencies change
  useEffect(() => {
    if (autoLoad) {
      fetchData(false).catch(() => {
        // Error already handled in fetchData
      });
    }
  }, [...dependencies]);
  
  return {
    data,
    isLoading,
    error,
    fetchData: () => fetchData(true),
    retryCount,
    isRetrying: retryCount > 0,
  };
}
