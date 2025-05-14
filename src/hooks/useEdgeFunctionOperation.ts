
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  processEdgeResponse, 
  handleEdgeError 
} from '@/lib/errors/clientErrorHandler';

interface UseEdgeFunctionOperationOptions<T> {
  functionName: string;
  showLoadingToast?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface EdgeFunctionState<T> {
  data: T | null;
  error: any;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  retryCount: number;
  isRetrying: boolean;
}

/**
 * Hook for handling edge function operations with consistent loading and error states
 */
export function useEdgeFunctionOperation<T = any, P = any>(
  options: UseEdgeFunctionOperationOptions<T>
) {
  const {
    functionName,
    showLoadingToast = false,
    showSuccessToast = false,
    showErrorToast = true,
    loadingMessage = 'Processing...',
    successMessage = 'Operation successful',
    errorMessage = 'Operation failed',
    onSuccess,
    onError,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<EdgeFunctionState<T>>({
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

  const execute = useCallback(
    async (params?: P): Promise<T | null> => {
      let toastId;
      
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
        const response = await supabase.functions.invoke(functionName, {
          body: params || {},
        });
        
        const result = await processEdgeResponse<T>(response);

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
        } else if (toastId) {
          toast.dismiss(toastId);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error,
          isLoading: false,
          isSuccess: false,
          isError: true,
          isRetrying: false,
        }));

        if (toastId) {
          toast.dismiss(toastId);
        }

        handleEdgeError(error, {
          showToast: showErrorToast,
          fallbackMessage: errorMessage,
          retryHandler: retry,
          errorCallback: onError
        });

        return null;
      }
    },
    [
      functionName,
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

    return execute(lastParams);
  }, [lastParams, state.retryCount, maxRetries, retryDelay, execute]);

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

export default useEdgeFunctionOperation;
