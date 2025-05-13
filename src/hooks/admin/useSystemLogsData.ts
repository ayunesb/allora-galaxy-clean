
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SystemLog, SystemLogFilterState } from '@/types/logs';
import { fetchSystemLogs, fetchLogModules, fetchLogEvents } from '@/services/logService';
import { useTenantId } from '@/hooks/useTenantId';

export const useSystemLogsData = () => {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SystemLogFilterState>({
    module: '',
    event: '',
    fromDate: null,
    toDate: null,
    searchTerm: ''
  });

  // Fetch logs with current filters
  const fetchLogs = async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchSystemLogs({
        tenant_id: tenantId,
        module: filters.module || undefined,
        event: filters.event || undefined,
        date_from: filters.fromDate,
        date_to: filters.toDate,
        search: filters.searchTerm || undefined,
        limit: 100
      });
      
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch logs');
      toast({
        title: 'Error loading logs',
        description: 'There was a problem loading the system logs.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available modules and events for filters
  const fetchMetadata = async () => {
    if (!tenantId) return;
    
    try {
      const moduleData = await fetchLogModules(tenantId);
      setModules(moduleData);
      
      const eventData = await fetchLogEvents(tenantId);
      setEvents(eventData);
    } catch (err) {
      console.error('Error fetching log metadata:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (tenantId) {
      fetchLogs();
      fetchMetadata();
    }
  }, [tenantId]);

  // Refetch when filters change
  useEffect(() => {
    if (tenantId) {
      fetchLogs();
    }
  }, [filters, tenantId]);

  const handleFilterChange = (newFilters: SystemLogFilterState) => {
    setFilters(newFilters);
  };

  return {
    logs,
    modules,
    events,
    isLoading,
    error,
    filters,
    setFilters: handleFilterChange,
    refetch: fetchLogs
  };
};

export default useSystemLogsData;
