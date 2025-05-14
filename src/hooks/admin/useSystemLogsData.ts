
import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { SystemLogFilter } from '@/types/shared';
import { SystemLog } from '@/types/logs';

export function useSystemLogsData(initialFilter: SystemLogFilter = { searchTerm: '' }) {
  const { currentWorkspace } = useWorkspace();
  const [data, setData] = useState<SystemLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filter, setFilter] = useState<SystemLogFilter>(initialFilter);
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);

  // Fetch available modules and events
  const fetchMetadata = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      // Fetch distinct modules
      const { data: modulesData } = await supabase
        .from('system_logs')
        .select('module')
        .eq('tenant_id', currentWorkspace.id)
        .is('module', 'not.null');
      
      if (modulesData) {
        const uniqueModules = Array.from(new Set(modulesData.map(item => item.module).filter(Boolean)));
        setModules(uniqueModules);
      }

      // Fetch distinct events
      const { data: eventsData } = await supabase
        .from('system_logs')
        .select('event')
        .eq('tenant_id', currentWorkspace.id)
        .is('event', 'not.null');
      
      if (eventsData) {
        const uniqueEvents = Array.from(new Set(eventsData.map(item => item.event).filter(Boolean)));
        setEvents(uniqueEvents);
      }
    } catch (err) {
      console.error('Error fetching log metadata:', err);
    }
  }, [currentWorkspace?.id]);

  // Fetch logs based on current filters
  const fetchLogs = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Start building the query
      let query = supabase
        .from('system_logs')
        .select('*', { count: 'exact' });

      // Apply tenant filter
      query = query.eq('tenant_id', currentWorkspace.id);

      // Apply module filter if specified
      if (filter.module) {
        if (Array.isArray(filter.module)) {
          query = query.in('module', filter.module);
        } else {
          query = query.eq('module', filter.module);
        }
      }

      // Apply event filter if specified
      if (filter.event) {
        query = query.eq('event', filter.event);
      }

      // Apply date range filter if specified
      if (filter.dateRange?.from) {
        query = query.gte('created_at', filter.dateRange.from.toISOString());

        if (filter.dateRange.to) {
          query = query.lte('created_at', filter.dateRange.to.toISOString());
        }
      }

      // Apply search term filter if specified
      if (filter.searchTerm) {
        query = query.or(
          `module.ilike.%${filter.searchTerm}%,event.ilike.%${filter.searchTerm}%,context.ilike.%${filter.searchTerm}%`
        );
      }

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      // Execute the query
      const { data, error, count } = await query;

      if (error) throw error;

      setData(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching system logs:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id, filter, currentPage, pageSize]);

  // Fetch logs and metadata when dependencies change
  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchMetadata();
      fetchLogs();
    }
  }, [currentWorkspace?.id, fetchMetadata, fetchLogs]);

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const changePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  // Refresh logs
  const refresh = () => {
    fetchLogs();
  };

  return {
    data,
    totalCount,
    isLoading,
    error,
    currentPage,
    pageSize,
    filter,
    modules,
    events,
    setFilter,
    goToPage,
    changePageSize,
    refresh,
  };
}
