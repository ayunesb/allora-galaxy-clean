
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Log, LogFilters, AuditLog } from '@/types/logs';
import { DateRange } from '@/types/logs';

export const useAdminLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<LogFilters>({
    startDate: undefined,
    endDate: undefined,
    module: undefined,
    status: undefined,
  });

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Example for how this might be implemented
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setLogs(data as unknown as AuditLog[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Re-fetch logs when filters change
  useEffect(() => {
    fetchLogs();
  }, [filters]);
  
  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const updateDateRange = (dateRange: DateRange) => {
    setFilters(prev => ({
      ...prev,
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to?.toISOString(),
    }));
  };
  
  return {
    logs,
    loading,
    error,
    filters,
    updateFilters,
    updateDateRange,
    refetch: fetchLogs,
  };
};

export default useAdminLogs;
