
import { useState, useEffect, useCallback, useRef } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { NetworkError, TimeoutError } from './errorTypes';
import { withRetry } from './retryUtils';
import { toast } from '@/components/ui/BetterToast';

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
  showRetryToast?: boolean;
  preserveData?: boolean;
  circuitBreaker?: {
    failureThreshold?: number;
    resetTimeout?: number;
  };
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
  showRetryToast = true,
  preserveData = true,
  circuitBreaker,
}: UseDataFetchingOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [retryCount, setRetryCount] = useState(0);
  const timerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const contextRef = useRef<Record<string, any>>({});
  
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
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // The fetch function with retry logic
  const fetchData = useCallback(async (manuallyTriggered = false) => {
    // Clear any existing errors
    clearError();
    
    // Store context information for debugging
    contextRef.current = {
      ...contextRef.current,
      manuallyTriggered,
      lastFetchAttempt: new Date().toISOString(),
      fetchCount: (contextRef.current.fetchCount || 0) + 1
    };
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Execute the fetch function using our retry utility
      const result = await withRetry(
        () => fetchFn(),
        {
          maxRetries,
          initialDelay: retryDelay,
          retryableErrors: shouldRetryFn,
          onRetry: (error, attempt, delay) => {
            setRetryCount(attempt);
            if (showRetryToast) {
              toast({
                title: "Retrying...",
                description: `Attempt ${attempt} of ${maxRetries}. Please wait.`,
                duration: delay - 500 // Toast disappears just before next try
              });
            }
          },
          context: contextRef.current,
          tenantId,
          module,
          circuitBreaker
        }
      );
      
      // Update state with result
      if (isMountedRef.current) {
        setData(result);
        setRetryCount(0);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
      }
      
      return result;
    } catch (err: any) {
      // Handle the error
      const alloraError = await handleError(err, {
        context: {
          ...contextRef.current,
          retryCount
        },
      });
      
      // Call error callback if provided
      if (onError) {
        onError(err);
      }
      
      throw alloraError;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    fetchFn,
    maxRetries,
    retryDelay,
    shouldRetryFn,
    onSuccess,
    onError,
    handleError,
    clearError,
    tenantId,
    module,
    showRetryToast,
    circuitBreaker
  ]);
  
  // Auto-fetch data when dependencies change
  useEffect(() => {
    if (autoLoad) {
      fetchData(false).catch(() => {
        // Error already handled in fetchData
      });
    }
  }, [...dependencies]);
  
  // Function to manually retry after an error
  const retry = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);
  
  return {
    data,
    isLoading,
    error,
    fetchData: () => fetchData(true),
    retry,
    retryCount,
    isRetrying: retryCount > 0,
    reset: clearError
  };
}

/**
 * Enhanced version that preserves previous data during refreshes
 */
export function useStableFetching<T>(options: UseDataFetchingOptions<T>) {
  const [stableData, setStableData] = useState<T | undefined>(options.initialData);
  
  const {
    data,
    isLoading,
    error,
    fetchData,
    retry,
    retryCount,
    isRetrying,
    reset
  } = useDataFetching<T>({
    ...options,
    onSuccess: (newData) => {
      setStableData(newData);
      if (options.onSuccess) {
        options.onSuccess(newData);
      }
    }
  });
  
  return {
    // Return stable data that doesn't reset during loading
    data: options.preserveData ? (stableData || data) : data,
    isLoading,
    error,
    fetchData,
    retry,
    retryCount,
    isRetrying,
    reset
  };
}
