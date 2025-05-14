
import { useState, useEffect, useCallback } from 'react';
import { handleError } from './ErrorHandler';
import { AlloraError } from './errorTypes';
import { withRetry } from './retryUtils';
import { notifyError } from '@/lib/notifications/toast';

/**
 * Enhanced hook for data fetching with error handling and retry logic
 */
export function useDataFetching<T = any>(
  fetchFn: () => Promise<T>,
  options: {
    onError?: (error: AlloraError) => void;
    onSuccess?: (data: T) => void;
    initialData?: T;
    dependencies?: any[];
    immediate?: boolean;
    retry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    shouldRetry?: (error: Error) => boolean;
    showErrorNotification?: boolean;
    silent?: boolean;
    preserveDataOnError?: boolean;
  } = {}
) {
  const {
    onError,
    onSuccess,
    initialData,
    dependencies = [],
    immediate = true,
    retry = false,
    maxRetries = 3,
    retryDelay = 1000,
    shouldRetry = () => true,
    showErrorNotification = true,
    silent = false,
    preserveDataOnError = false
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<AlloraError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(immediate);
  const [retryCount, setRetryCount] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let fetchFunction = fetchFn;
      
      // Apply retry logic if requested
      if (retry) {
        fetchFunction = () => withRetry(fetchFn, {
          maxRetries,
          delayMs: retryDelay,
          shouldRetry: (error) => shouldRetry(error),
          onRetry: () => {
            setRetryCount(prev => prev + 1);
          }
        });
      }

      const result = await fetchFunction();
      setData(result);
      setIsLoading(false);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const alloraError = await handleError(err, {
        showNotification: showErrorNotification,
        silent,
      });
      
      setError(alloraError);
      setIsLoading(false);
      
      if (!preserveDataOnError) {
        setData(initialData);
      }
      
      if (onError) {
        onError(alloraError);
      }
      
      throw alloraError;
    }
  }, [fetchFn, ...dependencies]);

  useEffect(() => {
    if (immediate) {
      fetchData().catch(err => {
        if (!silent && showErrorNotification) {
          notifyError("Data fetching failed", { 
            description: err.message || "Failed to load data" 
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...dependencies]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setData,
    retryCount,
  };
}

/**
 * Enhanced hook for stable data fetching that won't trigger multiple fetches
 */
export function useStableFetching<T = any>(
  fetchFn: () => Promise<T>,
  options: {
    onError?: (error: AlloraError) => void;
    onSuccess?: (data: T) => void;
    initialData?: T;
    dependencies?: any[];
    immediate?: boolean;
    retry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    shouldRetry?: (error: Error) => boolean;
    showErrorNotification?: boolean;
    silent?: boolean;
  } = {}
) {
  // Use a stable serialized version of the dependencies
  const serializedDependencies = JSON.stringify(options.dependencies || []);
  
  return useDataFetching(fetchFn, {
    ...options,
    dependencies: [serializedDependencies],
  });
}
