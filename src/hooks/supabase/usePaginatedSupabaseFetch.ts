
import { useState, useCallback } from 'react';
import { useSupabaseFetch } from './useSupabaseFetch';

/**
 * Options for configuring the query behavior
 */
type QueryOptions = {
  /** Whether the query should execute automatically */
  enabled?: boolean;
  /** Number of retry attempts on failure */
  retries?: number;
  /** Delay between retry attempts in milliseconds */
  retryDelay?: number;
  /** Duration in milliseconds that data remains fresh */
  staleTime?: number;
  /** Duration in milliseconds that unused data remains in cache */
  cacheTime?: number;
  /** Whether to use React Suspense for data loading */
  suspense?: boolean;
  /** Callback function executed on successful data fetch */
  onSuccess?: (data: any) => void;
  /** Callback function executed on fetch error */
  onError?: (error: Error) => void;
  /** Callback function executed when fetch completes (success or failure) */
  onSettled?: (data: any, error: Error | null) => void;
  /** Whether to show error toast notifications */
  showErrorToast?: boolean;
};

/**
 * Hook for handling paginated data from Supabase with error handling
 * 
 * This hook simplifies working with paginated data from Supabase,
 * providing utilities for page navigation and tracking total items/pages.
 * 
 * @param queryFn Function that fetches data with pagination parameters
 * @param options Configuration options for the query and pagination
 * @returns Object containing data, loading state, pagination state, and navigation functions
 * 
 * @example
 * ```tsx
 * // Define a query function that fetches paginated data
 * const fetchUsers = ({ page, pageSize }) => {
 *   return supabase
 *     .from('users')
 *     .select('*', { count: 'exact' })
 *     .range((page - 1) * pageSize, page * pageSize - 1)
 *     .then(({ data, count, error }) => {
 *       if (error) throw error;
 *       return { data, count: count || 0 };
 *     });
 * };
 * 
 * // Use the hook in a component
 * function UserList() {
 *   const {
 *     data: users,
 *     isLoading,
 *     error,
 *     page,
 *     totalPages,
 *     setPage,
 *     goToNextPage,
 *     goToPreviousPage
 *   } = usePaginatedSupabaseFetch(fetchUsers, { pageSize: 10 });
 * 
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorDisplay error={error} />;
 * 
 *   return (
 *     <div>
 *       <UserTable users={users} />
 *       <Pagination
 *         currentPage={page}
 *         totalPages={totalPages}
 *         onNextPage={goToNextPage}
 *         onPrevPage={goToPreviousPage}
 *         onPageSelect={setPage}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function usePaginatedSupabaseFetch<T = any>(
  queryFn: (pagination: { page: number; pageSize: number }) => Promise<{ data: T[]; count: number }>,
  options: QueryOptions & {
    /** Number of items per page */
    pageSize?: number;
    /** Initial page to display */
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
    /**
     * Navigate to a specific page
     * @param newPage The page number to navigate to
     */
    setPage: (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    /**
     * Navigate to the next page if not on the last page
     */
    goToNextPage: () => {
      if (page < totalPages) {
        setPage(page + 1);
      }
    },
    /**
     * Navigate to the previous page if not on the first page
     */
    goToPreviousPage: () => {
      if (page > 1) {
        setPage(page - 1);
      }
    },
  };
}
