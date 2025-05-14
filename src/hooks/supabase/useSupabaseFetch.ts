
import { useState, useEffect, useCallback } from 'react';
import { handleError } from '@/lib/errors/ErrorHandler';

type QueryState<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isPaused: boolean;
  isStale: boolean;
};

type QueryOptions = {
  enabled?: boolean;
  retries?: number;
  retryDelay?: number;
  staleTime?: number;
  cacheTime?: number;
  suspense?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: any, error: Error | null) => void;
  showErrorToast?: boolean;
};

/**
 * Core hook for data fetching from Supabase with error handling,
 * stale-while-revalidate pattern, and background retries
 */
export function useSupabaseFetch<T = any>(
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
) {
  const {
    enabled = true,
    retries = 3,
    retryDelay = 1000,
    staleTime = 5 * 60 * 1000, // 5 minutes
    onSuccess,
    onError,
    onSettled,
    showErrorToast = true,
  } = options;

  const [state, setState] = useState<QueryState<T>>({
    data: null,
    isLoading: enabled,
    isError: false,
    error: null,
    isPaused: false,
    isStale: false,
  });

  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [lastSuccessTime, setLastSuccessTime] = useState<number | null>(null);

  // Fetch data with retry logic
  const fetchData = useCallback(async (silent = false, isRetry = false) => {
    if (!enabled) return;
    
    if (!silent) {
      setState(prev => ({ ...prev, isLoading: !prev.data, isError: false, error: null }));
    }

    try {
      const result = await queryFn();
      
      setState({
        data: result,
        isLoading: false,
        isError: false,
        error: null,
        isPaused: false,
        isStale: false,
      });
      
      setLastFetchTime(Date.now());
      setLastSuccessTime(Date.now());
      setRetryCount(0);
      
      if (onSuccess) {
        onSuccess(result);
      }
      if (onSettled) {
        onSettled(result, null);
      }
      
      return result;
    } catch (error: any) {
      // Don't update state during background retries
      if (!isRetry) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isError: true,
          error: error instanceof Error ? error : new Error(error?.message || 'Unknown error'),
        }));
      }

      if (showErrorToast && !silent && !isRetry) {
        handleError(error, {
          context: { operation: 'data_fetch' },
          showNotification: true,
        });
      }
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(error?.message || 'Unknown error'));
      }
      if (onSettled) {
        onSettled(null, error instanceof Error ? error : new Error(error?.message || 'Unknown error'));
      }

      // Try background retry
      if (retryCount < retries && enabled) {
        setRetryCount(prev => prev + 1);
        const nextRetryDelay = retryDelay * Math.pow(2, retryCount) + Math.random() * 200;
        setTimeout(() => {
          fetchData(true, true).catch(() => {}); // Silently retry
        }, nextRetryDelay);
      }
      
      throw error;
    }
  }, [queryFn, enabled, retries, retryCount, retryDelay, onSuccess, onError, onSettled, showErrorToast]);

  // Check for stale data
  useEffect(() => {
    if (!lastSuccessTime || !staleTime) return;
    
    const checkStale = () => {
      if (Date.now() - lastSuccessTime > staleTime) {
        setState(prev => ({ ...prev, isStale: true }));
      }
    };
    
    const interval = setInterval(checkStale, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [lastSuccessTime, staleTime]);

  // Auto refetch stale data
  useEffect(() => {
    if (state.isStale && enabled && !state.isLoading) {
      fetchData(true).catch(() => {}); // Silent refetch for stale data
    }
  }, [state.isStale, enabled, state.isLoading, fetchData]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData().catch(() => {});
    }
  }, [enabled, fetchData]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isPaused: false }));
      if (state.isStale || state.isError) {
        fetchData().catch(() => {});
      }
    };
    
    const handleOffline = () => {
      setState(prev => ({ ...prev, isPaused: true }));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.isStale, state.isError, fetchData]);

  const refetch = useCallback(async (options: { silent?: boolean } = {}) => {
    return fetchData(options.silent || false);
  }, [fetchData]);

  return {
    ...state,
    refetch,
    retryCount,
    lastFetchTime,
    lastSuccessTime,
    reset: () => {
      setState({
        data: null,
        isLoading: enabled,
        isError: false,
        error: null,
        isPaused: false,
        isStale: false,
      });
      setRetryCount(0);
      setLastFetchTime(null);
      setLastSuccessTime(null);
    },
  };
}
