
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { fetchSystemLogs, fetchLogModules, fetchLogEvents } from '@/services/logService';
import { LogFilters } from '@/types/logs';
import { useDebounce } from '@/hooks/useDebounce';

export const useSystemLogs = (initialFilters: LogFilters = {}) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<LogFilters>(initialFilters);
  
  // Debounce the search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);
  
  // Construct query key with debounced search term
  const queryKey = useMemo(() => {
    return [
      'system-logs', 
      { 
        ...filters,
        searchTerm: debouncedSearchTerm
      }
    ];
  }, [filters, debouncedSearchTerm]);

  // Main query for logs with optimized caching
  const { 
    data: logs = [], 
    isLoading,
    error, 
    refetch,
    isFetching
  } = useQuery({
    queryKey,
    queryFn: () => fetchSystemLogs({
      ...filters,
      searchTerm: debouncedSearchTerm
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  // Query for available modules with longer cache time
  const { data: modules = [] } = useQuery({
    queryKey: ['log-modules'],
    queryFn: fetchLogModules,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
  });

  // Query for available event types with longer cache time
  const { data: events = [] } = useQuery({
    queryKey: ['log-events'],
    queryFn: fetchLogEvents,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
  });

  // Optimized filter update function with type safety
  const updateFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters and invalidate queries
  const resetFilters = useCallback(() => {
    setFilters({});
    queryClient.invalidateQueries({ queryKey: ['system-logs'] });
  }, [queryClient]);

  // Prefetch next page of logs if available
  const prefetchNextPage = useCallback(() => {
    if (logs.length >= (filters.limit || 0)) {
      const nextPageFilters = {
        ...filters,
        offset: (filters.offset || 0) + (filters.limit || 20)
      };
      
      queryClient.prefetchQuery({
        queryKey: ['system-logs', nextPageFilters],
        queryFn: () => fetchSystemLogs(nextPageFilters)
      });
    }
  }, [logs.length, filters, queryClient]);

  return {
    logs,
    isLoading,
    isFetching,
    error,
    modules,
    events,
    filters,
    updateFilters,
    resetFilters,
    refetch,
    prefetchNextPage
  };
};

export default useSystemLogs;
