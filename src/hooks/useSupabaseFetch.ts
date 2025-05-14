
import { useState, useEffect, useCallback } from 'react';
import { handleError } from '@/lib/errors/ErrorHandler';
import { notifyError } from '@/lib/notifications/toast';
import { supabase } from '@/integrations/supabase/client';

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
 * Custom hook for data fetching from Supabase with error handling,
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
    cacheTime = 10 * 60 * 1000, // 10 minutes
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

/**
 * Hook for handling paginated data from Supabase with error handling
 */
export function usePaginatedSupabaseFetch<T = any>(
  queryFn: (pagination: { page: number; pageSize: number }) => Promise<{ data: T[]; count: number }>,
  options: QueryOptions & {
    pageSize?: number;
    initialPage?: number;
  } = {}
) {
  const { pageSize = 10, initialPage = 1, ...restOptions } = options;
  const [page, setPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);

  const fetchWithPagination = useCallback(() => {
    return queryFn({ page, pageSize }).then(result => {
      setTotalItems(result.count);
      return result.data;
    });
  }, [queryFn, page, pageSize]);

  const result = useSupabaseFetch<T[]>(fetchWithPagination, restOptions);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    ...result,
    page,
    pageSize,
    totalPages,
    totalItems,
    setPage: (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    goToNextPage: () => {
      if (page < totalPages) {
        setPage(page + 1);
      }
    },
    goToPreviousPage: () => {
      if (page > 1) {
        setPage(page - 1);
      }
    },
  };
}

/**
 * Hook for handling data fetching with partial data display on errors
 */
export function usePartialDataFetch<T extends Record<string, any>>(
  queries: Record<string, () => Promise<any>>,
  options: QueryOptions = {}
) {
  const [state, setState] = useState<{
    data: Partial<T>;
    isLoading: boolean;
    errors: Record<string, Error | null>;
    completedQueries: string[];
    failedQueries: string[];
  }>({
    data: {},
    isLoading: true,
    errors: {},
    completedQueries: [],
    failedQueries: [],
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const results: Partial<T> = {};
    const errors: Record<string, Error | null> = {};
    const completedQueries: string[] = [];
    const failedQueries: string[] = [];
    
    await Promise.all(
      Object.entries(queries).map(async ([key, queryFn]) => {
        try {
          const result = await queryFn();
          results[key as keyof T] = result;
          completedQueries.push(key);
        } catch (error: any) {
          errors[key] = error instanceof Error ? error : new Error(error?.message || 'Unknown error');
          failedQueries.push(key);
          
          if (options.showErrorToast) {
            notifyError(`Error loading ${key}`, { 
              description: error?.message || 'Failed to load data'
            });
          }
        }
      })
    );
    
    setState({
      data: results,
      isLoading: false,
      errors,
      completedQueries,
      failedQueries,
    });
    
    return { results, errors };
  }, [queries, options.showErrorToast]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  const retryQuery = useCallback(async (key: string) => {
    if (!queries[key]) return;
    
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: null },
    }));
    
    try {
      const result = await queries[key]();
      setState(prev => ({
        ...prev,
        data: { ...prev.data, [key]: result },
        completedQueries: [...prev.completedQueries.filter(k => k !== key), key],
        failedQueries: prev.failedQueries.filter(k => k !== key),
        errors: { ...prev.errors, [key]: null },
      }));
      
      return result;
    } catch (error: any) {
      const formattedError = error instanceof Error ? error : new Error(error?.message || 'Unknown error');
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [key]: formattedError },
        failedQueries: [...prev.failedQueries.filter(k => k !== key), key],
        completedQueries: prev.completedQueries.filter(k => k !== key),
      }));
      
      if (options.showErrorToast) {
        notifyError(`Error loading ${key}`, { 
          description: error?.message || 'Failed to load data'
        });
      }
      
      throw error;
    }
  }, [queries, options.showErrorToast]);

  return {
    ...state,
    refetch: fetchData,
    retryQuery,
    isPartialData: state.failedQueries.length > 0 && state.completedQueries.length > 0,
    isComplete: state.completedQueries.length === Object.keys(queries).length,
  };
}
