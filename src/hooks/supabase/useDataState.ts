
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

interface UseDataStateOptions<T> {
  fetchFn: () => Promise<T>;
  queryKey: string | string[];
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  shouldFetch?: boolean;
}

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
    onSuccess: (data) => {
      if (successMessage) {
        toast({
          description: successMessage,
        });
      }
      onSuccess?.(data);
    },
    onError: (err: any) => {
      setIsRefreshing(false);
      toast({
        variant: "destructive",
        description: errorMessage || err?.message || 'An error occurred',
      });
      onError?.(err);
    },
  });

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        description: "Data refreshed successfully",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: err?.message || 'Failed to refresh data',
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
