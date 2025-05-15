
import { useState, useCallback, useEffect } from 'react';
import { handleError } from './ErrorHandler';

/**
 * Custom hook for data fetching with standardized error handling
 */
export function useDataFetching<T>(
  fetchFn: () => Promise<T>,
  options: {
    initialData?: T;
    autoFetch?: boolean;
    dependencies?: any[];
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    errorMessage?: string;
    showNotification?: boolean;
  } = {}
) {
  const {
    initialData,
    autoFetch = true,
    dependencies = [],
    onSuccess,
    onError,
    errorMessage,
    showNotification = false
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err: any) {
      // Use our centralized error handler
      const formattedError = await handleError(err, {
        context: { operation: 'data-fetching' },
        showNotification,
        module: 'data-fetching'
      });
      
      setError(formattedError);
      
      if (onError) {
        onError(formattedError);
      }
      
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, onSuccess, onError, showNotification]);

  useEffect(() => {
    if (autoFetch) {
      fetch().catch(() => {}); // We catch here to prevent unhandled promise rejections
    }
  }, [...dependencies]);

  return {
    data,
    isLoading,
    error,
    fetch,
    setData
  };
}

/**
 * Hook for stable data fetching with automatic retry and refresh capabilities
 */
export function useStableFetching<T>(
  fetchFn: () => Promise<T>,
  options: {
    initialData?: T;
    autoFetch?: boolean;
    dependencies?: any[];
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    errorMessage?: string;
    maxRetries?: number;
    retryDelay?: number;
    refreshInterval?: number;
    showNotification?: boolean;
  } = {}
) {
  const {
    initialData,
    autoFetch = true,
    dependencies = [],
    onSuccess,
    onError,
    errorMessage,
    maxRetries = 3,
    retryDelay = 1000,
    refreshInterval = 0,
    showNotification = false
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      setRetryCount(0);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err: any) {
      // Use our centralized error handler
      const formattedError = await handleError(err, {
        context: { 
          operation: 'stable-data-fetching',
          retryCount,
          maxRetries
        },
        showNotification,
        module: 'data-fetching'
      });
      
      setError(formattedError);
      
      if (onError) {
        onError(formattedError);
      }
      
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, onSuccess, onError, retryCount, maxRetries, showNotification]);

  // Auto retry logic
  const retry = useCallback(async () => {
    if (retryCount >= maxRetries || !error) {
      return;
    }
    
    setIsRetrying(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
      setRetryCount(prev => prev + 1);
      await fetch();
    } finally {
      setIsRetrying(false);
    }
  }, [fetch, retryCount, maxRetries, retryDelay, error]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetch().catch(() => {}); // We catch here to prevent unhandled promise rejections
    }
  }, [...dependencies]);

  // Refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return;
    
    const intervalId = setInterval(() => {
      if (!isLoading && !isRetrying) {
        fetch().catch(() => {});
      }
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [fetch, refreshInterval, isLoading, isRetrying]);

  // Auto retry effect
  useEffect(() => {
    if (error && retryCount < maxRetries && !isRetrying) {
      retry();
    }
  }, [error, retryCount, maxRetries, retry, isRetrying]);

  return {
    data,
    isLoading,
    error,
    fetch,
    retry,
    retryCount,
    isRetrying,
    setData
  };
}
