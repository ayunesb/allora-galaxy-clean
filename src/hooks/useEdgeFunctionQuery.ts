import { useQuery } from "@tanstack/react-query";
import {
  processEdgeResponse,
  handleEdgeError,
  convertSupabaseResponse,
  SupabaseFunctionResponse,
} from "@/lib/errors/clientErrorHandler";
import { ApiError } from "@/lib/errors/errorTypes";

export interface EdgeFunctionQueryOptions<TData = any, TError = any> {
  queryKey: string[];
  queryFn: () => Promise<TData | Response | SupabaseFunctionResponse<TData>>;
  onError?: (error: TError) => void;
  showToast?: boolean;
  errorMessage?: string;
  enabled?: boolean;
  staleTime?: number;
  retry?: boolean | number;
  retryDelay?: number;
  cacheTime?: number;
  // Include other UseQueryOptions properties as needed
}

/**
 * Custom hook for handling edge function queries with standard error handling
 */
export function useEdgeFunctionQuery<TData = any, TError = any>(
  options: EdgeFunctionQueryOptions<TData, TError>,
) {
  const {
    queryKey,
    queryFn,
    onError,
    showToast = true,
    errorMessage = "Failed to fetch data",
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
      if (response && typeof response === "object" && "data" in response) {
        const supabaseResponse = response as SupabaseFunctionResponse<TData>;

        // Convert to standard Response
        const standardResponse =
          convertSupabaseResponse<TData>(supabaseResponse);
        return processEdgeResponse<TData>(standardResponse);
      }

      return response as TData;
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError({
              message: error instanceof Error ? error.message : String(error),
              userMessage: errorMessage,
              source: "edge",
            });

      handleEdgeError(apiError, {
        showToast,
        fallbackMessage: errorMessage,
        errorCallback: onError as ((e: any) => void) | undefined,
      });

      throw apiError;
    }
  };

  return useQuery<TData, TError>({
    queryKey,
    queryFn: fetchData,
    ...(restOptions as any), // Cast to any to avoid type issues with restOptions
  });
}

// Simplifies usage with strongly typed edge function hooks
export function createEdgeFunctionQuery<
  TParams extends any[],
  TData,
  TError = any,
>(
  baseKey: string,
  fetcher: (
    ...args: TParams
  ) => Promise<TData | Response | SupabaseFunctionResponse<TData>>,
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
