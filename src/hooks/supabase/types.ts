
/**
 * Common types for Supabase fetch hooks
 */

export type QueryOptions = {
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

export type QueryState<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isPaused: boolean;
  isStale: boolean;
};
