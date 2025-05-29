import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  processEdgeResponse,
  handleEdgeError,
} from "@/lib/errors/clientErrorHandler";

interface UseEdgeFunctionOptions {
  showToast?: boolean;
  toastSuccessMessage?: string;
  showLoadingToast?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  retryOnError?: boolean;
}

interface UseEdgeFunctionState<T = any> {
  data: T | null;
  isLoading: boolean;
  error: any;
  isFetched: boolean;
}

interface UseEdgeFunctionReturn<T = any, P = any>
  extends UseEdgeFunctionState<T> {
  execute: (params?: P) => Promise<T | null>;
  reset: () => void;
  retry: () => Promise<T | null>;
}

/**
 * Hook for calling edge functions with standardized error handling
 */
export function useEdgeFunction<T = any, P = any>(
  fetcher: (params?: P) => Promise<any>,
  options: UseEdgeFunctionOptions = {},
): UseEdgeFunctionReturn<T, P> {
  const [state, setState] = useState<UseEdgeFunctionState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isFetched: false,
  });

  const [lastParams, setLastParams] = useState<P | undefined>(undefined);

  const {
    showToast = true,
    toastSuccessMessage,
    showLoadingToast = false,
    loadingMessage = "Processing request...",
    errorMessage = "Failed to process request",
    onSuccess,
    onError,
    retryOnError = false,
  } = options;

  const execute = useCallback(
    async (params?: P) => {
      setLastParams(params);
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      let toastId;
      if (showLoadingToast) {
        toastId = toast.loading(loadingMessage);
      }

      try {
        const response = await fetcher(params);
        // Handle different response types
        let result: T;

        if (response instanceof Response) {
          result = await processEdgeResponse<T>(response);
        } else {
          // Handle Supabase FunctionsResponse or direct data
          result = response.data || response;
        }

        setState({
          data: result,
          isLoading: false,
          error: null,
          isFetched: true,
        });

        if (showToast && toastSuccessMessage) {
          if (toastId) {
            toast.dismiss(toastId);
          }
          toast.success(toastSuccessMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          error,
          isFetched: true,
        });

        if (toastId) {
          toast.dismiss(toastId);
        }

        handleEdgeError(error, {
          showToast,
          fallbackMessage: errorMessage,
          retryHandler: retryOnError ? retry : undefined,
          errorCallback: onError,
        });

        return null;
      }
    },
    [
      fetcher,
      showToast,
      toastSuccessMessage,
      showLoadingToast,
      loadingMessage,
      errorMessage,
      onSuccess,
      onError,
      retryOnError,
    ],
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isFetched: false,
    });
  }, []);

  const retry = useCallback(async () => {
    return execute(lastParams);
  }, [execute, lastParams]);

  return {
    ...state,
    execute,
    reset,
    retry,
  };
}

export default useEdgeFunction;
