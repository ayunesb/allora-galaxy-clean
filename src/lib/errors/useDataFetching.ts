
import { useState, useCallback } from 'react';
import { useRetry } from './retryUtils';
import { useErrorHandler } from './useErrorHandler';
import { notifyPromise } from '@/lib/notifications/toast';

interface UseFetchingOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showLoadingToast?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  retryable?: boolean;
  maxAttempts?: number;
  context?: Record<string, any>;
}

/**
 * Hook for fetching data with error handling and retry capability
 */
export function useDataFetching<T>(options: UseFetchingOptions<T> = {}) {
  const {
    initialData,
    onSuccess,
    onError,
    showLoadingToast = false,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Data loaded successfully',
    errorMessage = 'Failed to load data',
    loadingMessage = 'Loading data...',
    retryable = true,
    maxAttempts = 3,
    context = {}
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();
  const { retryAsync, retryCount, isRetrying } = useRetry();

  const fetchData = useCallback(async (
    fetchFn: () => Promise<T>,
    fetchOptions: Partial<UseFetchingOptions<T>> = {}
  ) => {
    const {
      onSuccess: fnOnSuccess = onSuccess,
      onError: fnOnError = onError,
      showLoadingToast: fnShowLoadingToast = showLoadingToast,
      showSuccessToast: fnShowSuccessToast = showSuccessToast,
      showErrorToast: fnShowErrorToast = showErrorToast,
      successMessage: fnSuccessMessage = successMessage,
      errorMessage: fnErrorMessage = errorMessage,
      loadingMessage: fnLoadingMessage = loadingMessage,
      retryable: fnRetryable = retryable,
      maxAttempts: fnMaxAttempts = maxAttempts,
      context: fnContext = context
    } = fetchOptions;

    setIsLoading(true);
    setError(null);

    try {
      let result: T;
      
      if (fnShowLoadingToast) {
        result = await notifyPromise<T>(
          fnRetryable 
            ? retryAsync(() => fetchFn(), { maxAttempts: fnMaxAttempts })
            : fetchFn(),
          {
            loading: fnLoadingMessage,
            success: fnSuccessMessage,
            error: fnErrorMessage
          }
        );
      } else {
        result = await (fnRetryable
          ? retryAsync(() => fetchFn(), { maxAttempts: fnMaxAttempts })
          : fetchFn());
        
        if (fnShowSuccessToast) {
          // Success toast only if not using promise toast
          // This prevents duplicate toasts
        }
      }
      
      setData(result);
      if (fnOnSuccess) fnOnSuccess(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Only show error toast if not already shown by notifyPromise
      if (fnShowErrorToast && !fnShowLoadingToast) {
        await handleError(error, {
          context: { ...fnContext, action: 'fetchData' },
          showNotification: true,
          userMessage: fnErrorMessage
        });
      }
      
      if (fnOnError) fnOnError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [
    onSuccess, onError, showLoadingToast, showSuccessToast, showErrorToast,
    successMessage, errorMessage, loadingMessage, retryable, maxAttempts,
    context, handleError, retryAsync
  ]);

  return {
    data,
    isLoading: isLoading || isRetrying,
    error,
    fetchData,
    retryCount,
    isRetrying,
    reset: () => {
      setError(null);
      setData(initialData);
    }
  };
}

/**
 * A stable version of useDataFetching for use with React Query and similar libraries
 */
export function useStableFetching() {
  const { handleError } = useErrorHandler();
  const { retryAsync } = useRetry();

  const wrapFetchFn = useCallback(
    <T>(
      fetchFn: () => Promise<T>,
      options: {
        retryable?: boolean;
        maxAttempts?: number;
        context?: Record<string, any>;
      } = {}
    ) => {
      const {
        retryable = true,
        maxAttempts = 3,
        context = {}
      } = options;

      return async () => {
        try {
          return await (retryable
            ? retryAsync(() => fetchFn(), { maxAttempts })
            : fetchFn());
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          
          // Log the error but don't show UI notification (React Query will handle this)
          await handleError(error, {
            context: { ...context, action: 'queryFn' },
            showNotification: false,
          });
          
          throw error;
        }
      };
    },
    [handleError, retryAsync]
  );

  return {
    wrapFetchFn
  };
}
