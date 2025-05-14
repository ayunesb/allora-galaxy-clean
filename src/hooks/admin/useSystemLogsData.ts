
import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { DateRange } from '@/types/shared';

export interface SystemLogFilter {
  searchTerm: string;
  module?: string | string[];
  event?: string;
  dateRange?: DateRange;
}

export interface SystemLog {
  id: string;
  module: string;
  event: string;
  context: any;
  created_at: string;
  tenant_id?: string;
}

export function useSystemLogsData() {
  const { currentWorkspace } = useWorkspace();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState<SystemLogFilter>({
    searchTerm: '',
  });

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
      if (filters.module) {
        if (Array.isArray(filters.module)) {
          query = query.in('module', filters.module);
        } else {
          query = query.eq('module', filters.module);
        }
      }

      // Apply event filter if specified
      if (filters.event) {
        query = query.eq('event', filters.event);
      }

      // Apply date range filter if specified
      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());

        if (filters.dateRange.to) {
          query = query.lte('created_at', filters.dateRange.to.toISOString());
        }
      }

      // Apply search term filter if specified
      if (filters.searchTerm) {
        query = query.or(
          `module.ilike.%${filters.searchTerm}%,event.ilike.%${filters.searchTerm}%,context.ilike.%${filters.searchTerm}%`
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

      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching system logs:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id, filters, currentPage, pageSize]);

  // Fetch logs when dependencies change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle filter changes
  const updateFilters = (newFilters: Partial<SystemLogFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

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
  const refreshLogs = () => {
    fetchLogs();
  };

  return {
    logs,
    totalCount,
    isLoading,
    error,
    currentPage,
    pageSize,
    filters,
    refreshLogs,
    updateFilters: setFilters,
    goToPage,
    changePageSize,
  };
}
