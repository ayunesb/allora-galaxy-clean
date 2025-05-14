
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SystemLog, SystemLogFilter } from '@/types/logs';
import { SystemEventModule } from '@/types/shared';

interface UseSystemLogsDataReturn {
  data: SystemLog[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  pageSize: number;
  filter: SystemLogFilter;
  modules: SystemEventModule[];
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: SystemLogFilter) => void;
  refresh: () => Promise<void>;
  fetchLogs: (filter?: SystemLogFilter) => Promise<SystemLog[]>;
  totalPages: number;
}

export const useSystemLogsData = (): UseSystemLogsDataReturn => {
  const [data, setData] = useState<SystemLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState<SystemLogFilter>({});
  const [modules, setModules] = useState<SystemEventModule[]>([]);

  const fetchLogs = useCallback(async (customFilter?: SystemLogFilter): Promise<SystemLog[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const appliedFilter = customFilter || filter;
      
      // Start building query
      let query = supabase
        .from('system_logs')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (appliedFilter.searchTerm) {
        query = query.or(`event.ilike.%${appliedFilter.searchTerm}%,message.ilike.%${appliedFilter.searchTerm}%`);
      }
      
      if (appliedFilter.module) {
        if (Array.isArray(appliedFilter.module)) {
          query = query.in('module', appliedFilter.module);
        } else {
          query = query.eq('module', appliedFilter.module);
        }
      }
      
      if (appliedFilter.event) {
        query = query.eq('event', appliedFilter.event);
      }
      
      if (appliedFilter.severity) {
        query = query.eq('severity', appliedFilter.severity);
      }
      
      if (appliedFilter.dateRange?.from) {
        query = query.gte('created_at', appliedFilter.dateRange.from.toISOString());
        
        if (appliedFilter.dateRange.to) {
          query = query.lte('created_at', appliedFilter.dateRange.to.toISOString());
        }
      }
      
      if (appliedFilter.tenant) {
        query = query.eq('tenant_id', appliedFilter.tenant);
      }
      
      // Add pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Execute query with pagination
      const { data: logs, error: fetchError, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (fetchError) throw fetchError;
      
      // Fetch available modules for filtering
      const { data: moduleData } = await supabase
        .from('system_logs')
        .select('module')
        .distinct();
      
      if (moduleData) {
        setModules(moduleData.map(item => item.module as SystemEventModule));
      }
      
      setTotalCount(count || 0);
      setData(logs || []);
      return logs || [];
    } catch (err) {
      console.error('Error fetching system logs:', err);
      const error = err instanceof Error ? err : new Error('Failed to load system logs');
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filter, pageSize]);

  const refresh = useCallback(async () => {
    await fetchLogs();
  }, [fetchLogs]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    data,
    totalCount,
    isLoading,
    error,
    currentPage,
    pageSize,
    filter,
    modules,
    setCurrentPage,
    setPageSize,
    setFilter,
    refresh,
    fetchLogs,
    totalPages
  };
};
