
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

/**
 * Options for configuring the useDataState hook
 */
interface UseDataStateOptions<T> {
  /** Function to fetch the data */
  fetchFn: () => Promise<T>;
  /** Query key for React Query caching */
  queryKey: string | string[];
  /** Optional success message to show in toast notification */
  successMessage?: string;
  /** Error message to show in toast notification on failure */
  errorMessage?: string;
  /** Callback function executed on successful data fetch */
  onSuccess?: (data: T) => void;
  /** Callback function executed on fetch error */
  onError?: (error: any) => void;
  /** Whether the query should execute automatically */
  shouldFetch?: boolean;
}

/**
 * A hook for managing data fetching state with React Query
 * 
 * This hook simplifies data fetching with React Query, providing
 * loading states, error handling, and refresh functionality with
 * toast notifications for feedback.
 * 
 * @param options Configuration options for the data fetching
 * @returns Object containing data, loading state, error state, and refresh function
 * 
 * @example
 * ```tsx
 * // Define a fetch function
 * const fetchUserData = async () => {
 *   const { data, error } = await supabase
 *     .from('users')
 *     .select('*')
 *     .eq('id', userId)
 *     .single();
 *   
 *   if (error) throw error;
 *   return data;
 * };
 * 
 * // Use the hook in a component
 * function UserProfile({ userId }) {
 *   const {
 *     data: user,
 *     isLoading,
 *     error,
 *     refresh,
 *     isRefreshing
 *   } = useDataState({
 *     fetchFn: fetchUserData,
 *     queryKey: ['user', userId],
 *     successMessage: 'User data loaded successfully',
 *     errorMessage: 'Failed to load user data'
 *   });
 * 
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorDisplay error={error} />;
 * 
 *   return (
 *     <div>
 *       <UserInfo user={user} />
 *       <Button 
 *         onClick={refresh} 
 *         disabled={isRefreshing}
 *       >
 *         {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
 *       </Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDataState<T>({
  fetchFn,
  queryKey,
  successMessage,
  errorMessage = 'Failed to fetch data',
  onSuccess,
  onError,
  shouldFetch = true,
}: UseDataStateOptions<T>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: fetchFn,
    enabled: shouldFetch,
    meta: {
      onSuccess: (data: T) => {
        if (successMessage) {
          toast({
            title: successMessage,
          });
        }
        onSuccess?.(data);
      },
      onError: (err: any) => {
        setIsRefreshing(false);
        toast({
          variant: "destructive",
          title: errorMessage || err?.message || 'An error occurred',
        });
        onError?.(err);
      },
    }
  });

  /**
   * Manually refresh the data with visual feedback
   */
  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Data refreshed successfully",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: err?.message || 'Failed to refresh data',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    data,
    isLoading: isLoading || isRefreshing,
    error,
    refresh,
    isRefreshing,
  };
}
