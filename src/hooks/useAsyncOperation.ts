
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAsyncOperationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showLoadingToast?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  maxRetries?: number;
  retryDelay?: number;
}

interface AsyncOperationState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  retryCount: number;
  isRetrying: boolean;
}

/**
 * Hook for handling async operations with loading, error states and retry functionality
 */
export function useAsyncOperation<T = any, P = any>(options: UseAsyncOperationOptions<T> = {}) {
  const {
    onSuccess,
    onError,
    showLoadingToast = false,
    showSuccessToast = false,
    showErrorToast = true,
    loadingMessage = 'Processing...',
    successMessage = 'Operation completed successfully',
    errorMessage = 'Operation failed',
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    retryCount: 0,
    isRetrying: false,
  });

  // Store last used params for retry
  const [lastParams, setLastParams] = useState<P | undefined>(undefined);
  const [lastOperation, setLastOperation] = useState<
    ((params?: P) => Promise<T>) | null
  >(null);

  const execute = useCallback(
    async (asyncFunction: (params?: P) => Promise<T>, params?: P) => {
      let toastId;
      
      setLastOperation(() => asyncFunction);
      setLastParams(params);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
        isRetrying: prev.retryCount > 0
      }));

      if (showLoadingToast) {
        toastId = toast.loading(loadingMessage);
      }

      try {
        const result = await asyncFunction(params);

        setState({
          data: result,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
          retryCount: 0,
          isRetrying: false,
        });

        if (showSuccessToast) {
          if (toastId) {
            toast.dismiss(toastId);
          }
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        setState(prev => ({
          ...prev,
          error,
          isLoading: false,
          isSuccess: false,
          isError: true,
          isRetrying: false,
        }));

        if (showErrorToast) {
          if (toastId) {
            toast.dismiss(toastId);
          }
          
          toast.error(errorMessage, {
            description: error.message,
            action: {
              label: 'Retry',
              onClick: () => retry(),
            },
          });
        }

        if (onError) {
          onError(error);
        }

        throw error;
      }
    },
    [
      loadingMessage, 
      successMessage, 
      errorMessage, 
      showLoadingToast, 
      showSuccessToast, 
      showErrorToast,
      onSuccess,
      onError
    ]
  );

  const retry = useCallback(async () => {
    if (!lastOperation) return null;
    
    if (state.retryCount >= maxRetries) {
      toast.error(`Maximum retry attempts (${maxRetries}) reached`);
      return null;
    }

    setState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      isRetrying: true,
    }));

    // Add a small delay before retrying
    await new Promise(resolve => setTimeout(resolve, retryDelay));

    return execute(lastOperation, lastParams);
  }, [lastOperation, lastParams, state.retryCount, maxRetries, retryDelay, execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
      retryCount: 0,
      isRetrying: false,
    });
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
  };
}

export default useAsyncOperation;
