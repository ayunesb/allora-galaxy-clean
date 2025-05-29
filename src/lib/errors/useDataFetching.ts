import { useState, useCallback, useEffect } from "react";
import { handleError } from "./ErrorHandler";

/**
 * Custom hook for data fetching with standardized error handling
 */
export function useDataFetching<T = unknown>(fetch: () => Promise<T>, autoFetch = true) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetch();
      setData(result);

      return result;
    } catch (error: unknown) {
      // Use our centralized error handler
      const formattedError = await handleError(error, {
        context: { operation: "data-fetching" },
        showNotification: false,
        module: "data-fetching",
      });

      setError(formattedError);

      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  }, [fetch]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetch]); // add both autoFetch and fetch as dependencies

  return {
    data,
    isLoading,
    error,
    fetch: fetchData,
    setData,
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
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    maxRetries?: number;
    retryDelay?: number;
    refreshInterval?: number;
    showNotification?: boolean;
  } = {},
) {
  const {
    initialData,
    autoFetch = true,
    onSuccess,
    onError,
    maxRetries = 3,
    retryDelay = 1000,
    refreshInterval = 0,
    showNotification = false,
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
    } catch (error: unknown) {
      // Use our centralized error handler
      const formattedError = await handleError(error, {
        context: {
          operation: "stable-data-fetching",
          retryCount,
          maxRetries,
        },
        showNotification,
        module: "data-fetching",
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
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * Math.pow(2, retryCount)),
      );
      setRetryCount((prev) => prev + 1);
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
  }, [autoFetch, fetch]); // add both autoFetch and fetch as dependencies

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
    setData,
  };
}
