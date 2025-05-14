
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  processEdgeResponse, 
  handleEdgeError,
  type EdgeSuccessResponse 
} from '@/lib/errors/clientErrorHandler';

interface EdgeFunctionQueryOptions<TData = any, TError = any> extends Omit<UseQueryOptions<TData, TError>, 'queryFn'> {
  showToast?: boolean;
  toastSuccessMessage?: string;
  errorMessage?: string;
  retryOnError?: boolean;
}

interface EdgeFunctionMutationOptions<TData = any, TVariables = any, TError = any> 
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  showToast?: boolean;
  showLoadingToast?: boolean;
  loadingMessage?: string;
  toastSuccessMessage?: string;
  errorMessage?: string;
}

/**
 * Hook for querying edge functions with standardized error handling
 * @param endpointUrl The URL of the edge function
 * @param options Query options including error handling configuration
 * @returns React Query result with the response data
 */
export function useEdgeFunctionQuery<TData = any, TError = any>(
  endpointUrl: string,
  options: EdgeFunctionQueryOptions<TData, TError> = {}
) {
  const { 
    showToast = true,
    toastSuccessMessage,
    errorMessage = 'Failed to fetch data',
    retryOnError = false,
    ...queryOptions 
  } = options;
  
  return useQuery<TData, TError>({
    ...queryOptions,
    queryFn: async () => {
      try {
        const response = await fetch(endpointUrl);
        return await processEdgeResponse<TData>(response);
      } catch (error) {
        handleEdgeError(error, {
          showToast,
          fallbackMessage: errorMessage,
          retryHandler: retryOnError ? () => {
            // This will trigger a refetch
            return void 0;
          } : undefined
        });
        throw error;
      }
    }
  });
}

/**
 * Hook for mutating data with edge functions and standardized error handling
 * @param endpointUrl The URL of the edge function
 * @param options Mutation options including error handling configuration
 * @returns React Query mutation result
 */
export function useEdgeFunctionMutation<TData = any, TVariables = any, TError = any>(
  endpointUrl: string,
  options: EdgeFunctionMutationOptions<TData, TVariables, TError> = {}
) {
  const { 
    showToast = true,
    showLoadingToast = false,
    loadingMessage = 'Processing request...',
    toastSuccessMessage,
    errorMessage = 'Failed to process request',
    ...mutationOptions 
  } = options;
  
  return useMutation<TData, TError, TVariables>({
    ...mutationOptions,
    mutationFn: async (variables) => {
      let toastId;
      if (showLoadingToast) {
        toastId = toast.loading(loadingMessage);
      }
      
      try {
        const response = await fetch(endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(variables),
        });

        const result = await processEdgeResponse<TData>(response);
        
        if (toastId) {
          toast.dismiss(toastId);
        }
        
        if (showToast && toastSuccessMessage) {
          toast.success(toastSuccessMessage);
        }
        
        return result;
      } catch (error) {
        if (toastId) {
          toast.dismiss(toastId);
        }
        
        handleEdgeError(error, {
          showToast,
          fallbackMessage: errorMessage
        });
        
        throw error;
      }
    }
  });
}

/**
 * Helper hook for fetching data from edge functions with proper typing
 */
export function useTypedEdgeFunctionQuery<T = any>(
  endpointUrl: string,
  options: EdgeFunctionQueryOptions<T> = {}
) {
  return useEdgeFunctionQuery<T>(endpointUrl, {
    ...options,
    select: (data: any) => {
      if (data && typeof data === 'object' && 'data' in data) {
        return data.data as T;
      }
      return data as T;
    }
  });
}
