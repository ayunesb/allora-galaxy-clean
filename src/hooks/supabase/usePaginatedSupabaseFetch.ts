
import { useState, useCallback } from 'react';
import { useSupabaseFetch } from './useSupabaseFetch';

type QueryOptions = {
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

/**
 * Hook for handling paginated data from Supabase with error handling
 */
export function usePaginatedSupabaseFetch<T = any>(
  queryFn: (pagination: { page: number; pageSize: number }) => Promise<{ data: T[]; count: number }>,
  options: QueryOptions & {
    pageSize?: number;
    initialPage?: number;
  } = {}
) {
  const { pageSize = 10, initialPage = 1, ...restOptions } = options;
  const [page, setPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);

  const fetchWithPagination = useCallback(() => {
    return queryFn({ page, pageSize }).then(result => {
      setTotalItems(result.count);
      return result.data;
    });
  }, [queryFn, page, pageSize]);

  const result = useSupabaseFetch<T[]>(fetchWithPagination, restOptions);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    ...result,
    page,
    pageSize,
    totalPages,
    totalItems,
    setPage: (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    goToNextPage: () => {
      if (page < totalPages) {
        setPage(page + 1);
      }
    },
    goToPreviousPage: () => {
      if (page > 1) {
        setPage(page - 1);
      }
    },
  };
}
