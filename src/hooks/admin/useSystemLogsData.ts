
import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { SystemLogFilter, SystemEventModule, LogSeverity } from '@/types/shared';
import { SystemLog } from '@/types/logs';

export interface UseSystemLogsDataProps {
  initialFilter?: SystemLogFilter;
  pageSize?: number;
}

export function useSystemLogsData({
  initialFilter = { searchTerm: '' },
  pageSize = 25
}: UseSystemLogsDataProps = {}) {
  const { currentWorkspace } = useWorkspace();
  const [data, setData] = useState<SystemLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<SystemLogFilter>(initialFilter);
  const [modules, setModules] = useState<SystemEventModule[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [severities, setSeverities] = useState<LogSeverity[]>([]);

  // Fetch available modules, events, and severities
  const fetchMetadata = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      // Fetch distinct modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('system_logs')
        .select('module')
        .eq('tenant_id', currentWorkspace.id)
        .is('module', 'not.null');
      
      if (modulesData) {
        const uniqueModules = Array.from(
          new Set(modulesData.map(item => item.module))
        ) as SystemEventModule[];
        setModules(uniqueModules);
      }

      // Fetch distinct events
      const { data: eventsData, error: eventsError } = await supabase
        .from('system_logs')
        .select('event')
        .eq('tenant_id', currentWorkspace.id)
        .is('event', 'not.null');
      
      if (eventsData) {
        const uniqueEvents = Array.from(
          new Set(eventsData.map(item => item.event))
        );
        setEvents(uniqueEvents);
      }
      
      // Fetch distinct severities
      const { data: severitiesData, error: severitiesError } = await supabase
        .from('system_logs')
        .select('severity')
        .eq('tenant_id', currentWorkspace.id)
        .is('severity', 'not.null');
      
      if (severitiesData) {
        const uniqueSeverities = Array.from(
          new Set(severitiesData.map(item => item.severity))
        ) as LogSeverity[];
        setSeverities(uniqueSeverities.length > 0 ? uniqueSeverities : ['info', 'warning', 'error', 'debug', 'critical']);
      }
      
      if (modulesError || eventsError || severitiesError) {
        console.error('Error fetching log metadata:', { modulesError, eventsError, severitiesError });
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
      
      // Apply severity filter if specified
      if (filter.severity) {
        query = query.eq('severity', filter.severity);
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
          `event.ilike.%${filter.searchTerm}%,module.ilike.%${filter.searchTerm}%,context.ilike.%${filter.searchTerm}%`
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
  
  // Export logs to CSV
  const exportToCsv = useCallback(async () => {
    if (!data.length) return null;
    
    // Create CSV header
    const headers = ['ID', 'Module', 'Severity', 'Event', 'Message', 'Created At', 'Context'];
    
    // Convert logs to CSV rows
    const rows = data.map(log => [
      log.id,
      log.module,
      log.severity,
      log.event,
      log.message || '',
      log.created_at,
      JSON.stringify(log.context)
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return csvContent;
  }, [data]);

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
    severities,
    setFilter,
    goToPage,
    changePageSize,
    refresh,
    exportToCsv,
    totalPages: Math.ceil(totalCount / pageSize)
  };
}
