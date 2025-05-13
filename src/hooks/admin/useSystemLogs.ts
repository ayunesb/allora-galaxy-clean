
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchSystemLogs, fetchLogModules, fetchLogEvents } from '@/services/logService';
import { LogFilters } from '@/types/logs';

export const useSystemLogs = (initialFilters: LogFilters = {}) => {
  const [filters, setFilters] = useState<LogFilters>(initialFilters);

  const { data: logs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['system-logs', filters],
    queryFn: () => fetchSystemLogs(filters),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['log-modules'],
    queryFn: fetchLogModules,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['log-events'],
    queryFn: fetchLogEvents,
  });

  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  return {
    logs,
    isLoading,
    error,
    modules,
    events,
    filters,
    updateFilters,
    resetFilters,
    refetch,
  };
};

export default useSystemLogs;
