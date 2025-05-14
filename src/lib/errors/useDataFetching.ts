
import { useState, useCallback, useEffect } from 'react';
import { handleError } from './ErrorHandler';
import { useRetry } from './retryUtils';

interface FetchOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  dependencies?: any[];
  skip?: boolean;
  context?: Record<string, any>;
  showNotification?: boolean;
  logToSystem?: boolean;
  tenantId?: string;
  module?: string;
  retry?: boolean;
  maxRetries?: number;
}

/**
 * Hook for fetching data with error handling and loading state
 */
export function useDataFetching<T>(
  fetchFn: () => Promise<T>,
  options: FetchOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFetched, setIsFetched] = useState<boolean>(false);
  
  const {
    onSuccess,
    onError,
    dependencies = [],
    skip = false,
    context = {},
    showNotification = true,
    logToSystem = true,
    tenantId = 'system',
    module = 'system',
    retry = false,
    maxRetries = 3
  } = options;
  
  const retryHandler = useRetry(() => fetchFn(), {
    maxAttempts: maxRetries,
    showFeedback: retry,
    feedbackMessage: "Fetching data failed, retrying..."
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let result;
      if (retry) {
        result = await retryHandler.execute();
      } else {
        result = await fetchFn();
      }
      
      setData(result);
      setIsFetched(true);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err: any) {
      setError(err);
      await handleError(err, {
        context: {
          ...context,
          operation: 'data_fetch'
        },
        showNotification,
        logToSystem,
        tenantId,
        module,
        silent: !showNotification,
        rethrow: false
      });
      
      if (onError && err instanceof Error) {
        onError(err);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, onSuccess, onError, retry, retryHandler, context, showNotification, logToSystem, tenantId, module]);
  
  useEffect(() => {
    if (!skip) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, skip]);
  
  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    isFetched,
    reset: () => {
      setData(null);
      setError(null);
      setIsFetched(false);
    }
  };
}

/**
 * Hook for fetching data with stable references (for use in effects)
 */
export function useStableFetching<T>(
  fetchFn: () => Promise<T>,
  options: FetchOptions = {}
) {
  // Store the function ref to avoid re-fetching on render
  const [stableFn] = useState(() => fetchFn);
  return useDataFetching(stableFn, options);
}
