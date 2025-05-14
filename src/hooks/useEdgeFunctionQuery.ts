
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { processEdgeResponse, handleEdgeError } from '@/lib/errors/clientErrorHandler';

// Only import the types we are actually using
// Removed unused EdgeSuccessResponse import

export interface EdgeFunctionQueryOptions<TData = any, TError = any> {
  queryKey: string[];
  queryFn: () => Promise<TData>;
  onError?: (error: TError) => void;
  showToast?: boolean;
  errorMessage?: string;
  enabled?: boolean;
  staleTime?: number;
  retry?: boolean | number;
  // Include other UseQueryOptions properties as needed
}

/**
 * Custom hook for handling edge function queries with standard error handling
 */
export function useEdgeFunctionQuery<TData = any, TError = any>(
  options: EdgeFunctionQueryOptions<TData, TError>
) {
  const {
    queryKey,
    queryFn,
    onError,
    showToast = true,
    errorMessage = 'Failed to fetch data',
    ...restOptions
  } = options;

  const fetchData = async () => {
    try {
      const response = await queryFn();
      
      // Handle different response types
      if (response instanceof Response) {
        return processEdgeResponse<TData>(response);
      } 
      
      // For Supabase edge function responses
      if (response && typeof response === 'object' && 'data' in response) {
        // Create an adapter for Supabase functions response
        const responseAdapter = new Response(
          JSON.stringify(response.data), 
          { status: response.error ? 400 : 200 }
        );
        
        // Add Supabase error to response if it exists
        if (response.error) {
          Object.defineProperty(responseAdapter, 'supabaseError', {
            value: response.error,
            writable: false
          });
        }
        
        return processEdgeResponse<TData>(responseAdapter);
      }
      
      return response as TData;
    } catch (error) {
      handleEdgeError(error, {
        showToast,
        fallbackMessage: errorMessage,
        errorCallback: onError as ((e: any) => void) | undefined
      });
      throw error;
    }
  };

  return useQuery<TData, TError>({
    queryKey,
    queryFn: fetchData,
    ...restOptions as any, // Cast to any to avoid type issues with restOptions
  });
}

// Simplifies usage with strongly typed edge function hooks
export function createEdgeFunctionQuery<TParams extends any[], TData, TError = any>(
  baseKey: string,
  fetcher: (...args: TParams) => Promise<TData>
) {
  return (...args: TParams) => {
    const options: EdgeFunctionQueryOptions<TData, TError> = {
      queryKey: [baseKey, ...args],
      queryFn: () => fetcher(...args),
      // Default options can be overridden when used
    };
    
    return options;
  };
}
