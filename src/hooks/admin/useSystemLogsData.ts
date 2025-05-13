
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SystemLogFilterState } from '@/types/logs';
import { useSystemLogs, useLogModules, useLogEvents } from '@/services/logService';
import { useTenantId } from '@/hooks/useTenantId';

export const useSystemLogsData = () => {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const [filters, setFilters] = useState<SystemLogFilterState>({
    module: '',
    event: '',
    searchTerm: '',
    fromDate: null,
    toDate: null
  });

  const { 
    data: logs = [], 
    isLoading,
    error,
    refetch,
    isFetching
  } = useSystemLogs({
    tenant_id: tenantId,
    module: filters.module || undefined,
    event: filters.event || undefined,
    search: filters.searchTerm || undefined,
    date_from: filters.fromDate,
    date_to: filters.toDate,
    limit: 100
  });

  const { data: modules = [] } = useLogModules(tenantId);
  const { data: events = [] } = useLogEvents(tenantId);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading logs',
        description: 'There was a problem loading the system logs.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleFilterChange = (newFilters: SystemLogFilterState) => {
    setFilters(newFilters);
  };

  return {
    logs,
    modules,
    events,
    isLoading: isLoading || isFetching,
    error,
    filters,
    setFilters: handleFilterChange,
    refetch
  };
};

export default useSystemLogsData;
