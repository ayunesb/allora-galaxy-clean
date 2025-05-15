
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/lib/notifications/toast';
import type { SystemLog, LogFilters } from '@/types/logs';

export function useAdminLogs(initialFilters: Partial<LogFilters> = {}) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<LogFilters>({
    level: undefined,
    module: undefined,
    tenant_id: undefined,
    startDate: undefined,
    endDate: undefined,
    searchTerm: undefined,
    status: undefined,
    ...initialFilters
  });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filters.level) {
        query = query.eq('level', filters.level);
      }
      
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      if (filters.searchTerm) {
        query = query.ilike('message', `%${filters.searchTerm}%`);
      }
      
      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      const { data, count: totalCount, error } = await query;
      
      if (error) {
        throw new Error(`Error fetching logs: ${error.message}`);
      }
      
      setLogs(data as SystemLog[]);
      setCount(totalCount || 0);
    } catch (error) {
      console.error('Error in useAdminLogs:', error);
      notify({ 
        title: 'Error loading logs',
        description: error instanceof Error ? error.message : 'Unknown error'
      }, { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  const updateFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      level: undefined,
      module: undefined,
      tenant_id: undefined,
      startDate: undefined,
      endDate: undefined,
      searchTerm: undefined,
      status: undefined
    });
    setPage(1);
  }, []);

  return {
    logs,
    count,
    isLoading,
    filters,
    page,
    pageSize,
    setPage,
    setPageSize,
    fetchLogs,
    updateFilters,
    clearFilters
  };
}
