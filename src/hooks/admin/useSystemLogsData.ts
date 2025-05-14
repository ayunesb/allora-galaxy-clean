
import { useState, useEffect, useCallback } from 'react';
import { SystemLog, LogFilters } from '@/types/logs';
import { supabase } from '@/integrations/supabase/client';

export const useSystemLogsData = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<LogFilters>({
    search: '',
    startDate: undefined,
    endDate: undefined,
    module: undefined,
    status: undefined,
    limit: 50,
    page: 1,
  });

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Create date range condition
      let startDate = filters.startDate || filters.fromDate;
      let endDate = filters.endDate || filters.toDate;
      
      // Build the query
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(filters.limit || 50);
      
      // Add filter conditions if provided
      if (filters.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.search) {
        query = query.or(`description.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching system logs:", error);
        throw error;
      }
      
      // Transform the data to match SystemLog interface
      const transformedLogs: SystemLog[] = (data || []).map(item => ({
        ...item,
        timestamp: item.created_at, // Ensure timestamp is set
        message: item.message || item.description, // Ensure message is set
        event_type: item.event_type || 'info', // Default event_type
      }));
      
      setLogs(transformedLogs);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  
  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  return {
    logs,
    isLoading,
    filters,
    updateFilters,
    refetch: fetchLogs
  };
};

export default useSystemLogsData;
