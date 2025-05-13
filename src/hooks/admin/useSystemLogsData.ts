
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { SystemLog, LogFilters } from '@/types';
import { fetchSystemLogs, fetchLogModules, fetchLogEvents } from '@/services/logService';

export type SystemLogFilterState = {
  module: string;
  event: string;
  fromDate: Date | null;
  toDate: Date | null;
  searchTerm: string;
};

export const useSystemLogsData = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<SystemLogFilterState>({
    module: '',
    event: '',
    fromDate: null,
    toDate: null,
    searchTerm: ''
  });

  // Query for system logs with current filters
  const {
    data: logs = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['systemLogs', filters],
    queryFn: () => fetchSystemLogs({
      module: filters.module || undefined,
      searchTerm: filters.searchTerm || undefined,
      dateRange: filters.fromDate || filters.toDate ? {
        from: filters.fromDate,
        to: filters.toDate
      } : undefined
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for unique log modules (for filtering)
  const { data: modules = [] } = useQuery({
    queryKey: ['logModules'],
    queryFn: fetchLogModules,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Query for unique log events (for filtering)
  const { data: events = [] } = useQuery({
    queryKey: ['logEvents'],
    queryFn: fetchLogEvents,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Handle errors
  if (fetchError) {
    toast({
      title: 'Error loading logs',
      description: 'There was a problem loading the system logs.',
      variant: 'destructive',
    });
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: SystemLogFilterState) => {
    setFilters(newFilters);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      module: '',
      event: '',
      fromDate: null,
      toDate: null,
      searchTerm: ''
    });
  };

  return {
    logs: logs as SystemLog[],
    isLoading,
    filters,
    modules,
    events,
    setFilters: handleFilterChange,
    resetFilters: handleResetFilters,
    refetch
  };
};

export default useSystemLogsData;
