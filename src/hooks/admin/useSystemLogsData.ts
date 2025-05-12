
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog, LogFilters } from '@/types/logs';
import { useTenantId } from '@/hooks/useTenantId';

export const useSystemLogsData = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Partial<LogFilters>>({});
  const { tenantId } = useTenantId();
  
  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*');
      
      // Apply tenant filter if applicable
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      // Apply filters
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.event) {
        query = query.eq('event', filters.event);
      }
      
      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }
      
      if (filters.toDate) {
        query = query.lte('created_at', filters.toDate);
      }
      
      if (filters.searchTerm) {
        query = query.or(`event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%`);
      }
      
      // Order by created_at DESC
      query = query.order('created_at', { ascending: false });
      
      // Limit to 100 records
      query = query.limit(100);
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching system logs:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch logs on mount and when filters change
  useEffect(() => {
    fetchLogs();
  }, [tenantId, filters]);
  
  return {
    logs,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchLogs
  };
};
