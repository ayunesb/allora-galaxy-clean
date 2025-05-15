
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog, LogFilters, DateRange } from '@/types/logs';

export const useAdminLogs = (initialFilters: LogFilters = {}) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<LogFilters>(initialFilters);

  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      // Apply filters
      if (filters.search) {
        query = query.ilike('message', `%${filters.search}%`);
      }
      
      if (filters.level && filters.level.length) {
        query = query.in('level', filters.level);
      }
      
      if (filters.module && filters.module.length) {
        query = query.in('module', filters.module);
      }
      
      if (filters.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }
      
      if (filters.dateRange?.from) {
        const fromDate = filters.dateRange.from.toISOString();
        query = query.gte('created_at', fromDate);
      }
      
      if (filters.dateRange?.to) {
        const toDate = filters.dateRange.to.toISOString();
        query = query.lte('created_at', toDate);
      }
      
      const { data, error: err } = await query.limit(100);
      
      if (err) {
        throw err;
      }
      
      setLogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, [filters]);
  
  return {
    logs,
    loading,
    error,
    filters,
    updateFilters,
    refresh: fetchLogs
  };
};
