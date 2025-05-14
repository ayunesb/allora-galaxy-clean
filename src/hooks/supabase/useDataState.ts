
import { useState, useEffect, useCallback } from 'react';
import { notifyError } from '@/lib/notifications/toast';

/**
 * A hook for easily fetching data with built-in loading, error, and empty states
 */
export function useDataState<T = any>(
  fetchFn: () => Promise<T>,
  options: {
    enabled?: boolean;
    retries?: number;
    retryDelay?: number;
    initialData?: T | null;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    showErrorToast?: boolean;
    dependencies?: any[];
  } = {}
) {
  const {
    enabled = true,
    retries = 3,
    retryDelay = 1000,
    initialData = null,
    onSuccess,
    onError,
    showErrorToast = true,
    dependencies = [],
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  const executeQuery = useCallback(async (silent: boolean = false) => {
    if (!enabled) return;
    
    if (!silent) {
      setIsLoading(true);
      setIsError(false);
      setError(null);
    }
    
    try {
      const result = await fetchFn();
      
      setData(result);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      setRetryCount(0);
      setIsRetrying(false);
      setIsSuccess(true);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      setIsLoading(false);
      setIsError(true);
      setError(error);
      setIsRetrying(false);
      setIsSuccess(false);
      
      if (showErrorToast && !silent) {
        notifyError('Failed to fetch data', { 
          description: error.message
        });
      }
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    }
  }, [enabled, fetchFn, onSuccess, onError, showErrorToast]);
  
  const retry = useCallback(async () => {
    if (retryCount >= retries) {
      notifyError('Maximum retry attempts reached');
      return;
    }
    
    setRetryCount(prev => prev + 1);
    setIsRetrying(true);
    
    try {
      await executeQuery(true);
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, retries, executeQuery]);
  
  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(enabled);
    setIsError(false);
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);
    setIsSuccess(false);
  }, [enabled, initialData]);
  
  // Effect to fetch data on mount and when dependencies change
  useEffect(() => {
    if (enabled) {
      executeQuery().catch(() => {});
    }
  }, [enabled, executeQuery, ...dependencies]);
  
  return {
    data,
    isLoading,
    isError,
    error,
    retryCount,
    isRetrying,
    isSuccess,
    refetch: executeQuery,
    retry,
    reset,
  };
}
