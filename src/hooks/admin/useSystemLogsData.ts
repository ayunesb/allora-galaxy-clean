
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog, LogFilters } from '@/types/logs';
import { useTenantId } from '@/hooks/useTenantId';
import { formatDate } from '@/lib/utils/date';

export const useSystemLogsData = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LogFilters>({});
  const { tenantId } = useTenantId();

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
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
        const formattedFromDate = formatDate(filters.fromDate.toISOString(), 'yyyy-MM-dd');
        query = query.gte('created_at', `${formattedFromDate}T00:00:00`);
      }
      
      if (filters.toDate) {
        const formattedToDate = formatDate(filters.toDate.toISOString(), 'yyyy-MM-dd');
        query = query.lte('created_at', `${formattedToDate}T23:59:59`);
      }
      
      if (filters.searchTerm) {
        // Use ilike for case-insensitive search
        query = query.or(`event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%`);
      }
      
      // Limit to 100 records
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching system logs:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, filters]);
  
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  
  return {
    logs,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchLogs
  };
};
