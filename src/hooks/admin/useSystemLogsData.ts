
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AuditLog, LogFilters, SystemEventModule } from '@/types/logs';
import { DateRange } from '@/types/shared';
import { format } from 'date-fns';

export function useSystemLogsData(initialFilters: LogFilters = {}) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<LogFilters>(initialFilters);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
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
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      
      setLogs(data as AuditLog[]);
    } catch (error) {
      console.error('Error fetching system logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [
    filters.module,
    filters.event,
    filters.fromDate,
    filters.toDate,
    filters.tenant_id,
    filters.searchTerm
  ]);

  const handleFilterChange = (newFilters: LogFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleDateRangeChange = (dateRange: DateRange | null) => {
    if (!dateRange) {
      const { fromDate, toDate, ...rest } = filters;
      setFilters(rest);
      return;
    }
    
    const newFilters: LogFilters = { ...filters };
    
    if (dateRange.from) {
      newFilters.fromDate = format(dateRange.from, 'yyyy-MM-dd');
    }
    
    if (dateRange.to) {
      newFilters.toDate = format(dateRange.to, 'yyyy-MM-dd');
    }
    
    setFilters(newFilters);
  };

  const refetchLogs = () => {
    fetchLogs();
  };

  return {
    logs,
    isLoading,
    filters,
    setFilters: handleFilterChange,
    refetchLogs,
    handleDateRangeChange
  };
}
