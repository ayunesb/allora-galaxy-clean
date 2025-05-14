
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LogFilters } from '@/types/logs';

export const useAdminLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<LogFilters>({
    module: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    search: '',
  });
  
  useEffect(() => {
    fetchLogs();
  }, [filters]);
  
  const fetchLogs = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await fetchLogsFromApi(filters);
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchLogsFromApi = async (filters: LogFilters) => {
    // This would typically be an API call
    // For now, we'll use the Supabase client directly
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filters.module) {
      query = query.eq('module', filters.module);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.fromDate) {
      query = query.gte('created_at', filters.fromDate);
    }
    
    if (filters.toDate) {
      query = query.lte('created_at', filters.toDate);
    }
    
    if (filters.searchTerm) {
      query = query.ilike('description', `%${filters.searchTerm}%`);
    }
    
    return query.limit(100);
  };
  
  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({...prev, ...newFilters}));
  };
  
  return {
    logs,
    isLoading,
    filters,
    updateFilters,
    refetch: fetchLogs,
  };
};

export default useAdminLogs;
