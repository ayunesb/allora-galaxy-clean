
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuditLog } from '@/types/logs';
import { SystemEventModule } from '@/types/shared';
import { DateRange } from '@/types/shared';
import { supabase } from '@/lib/supabase';

interface AdminLogFilters {
  searchTerm: string;
  dateRange?: DateRange;
  module?: SystemEventModule;
}

export function useAdminLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AdminLogFilters>({
    searchTerm: '',
  });

  useEffect(() => {
    fetchSystemLogs();
  }, [filters]);

  const fetchSystemLogs = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      // Apply module filter if provided
      if (filters.module && filters.module !== 'system') {
        query = query.eq('module', filters.module);
      }
        
      // Apply search filter if provided
      if (filters.searchTerm) {
        query = query.or(`event.ilike.%${filters.searchTerm}%,context.ilike.%${filters.searchTerm}%`);
      }
      
      // Apply date range filter if provided
      if (filters.dateRange?.from) {
        const fromDate = filters.dateRange.from.toISOString();
        query = query.gte('created_at', fromDate);
        
        if (filters.dateRange.to) {
          const toDate = filters.dateRange.to.toISOString();
          query = query.lte('created_at', toDate);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setLogs(data as AuditLog[]);
    } catch (error: any) {
      console.error('Error fetching system logs:', error);
      toast({
        title: 'Error fetching system logs',
        description: error.message || 'Failed to load system logs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refetchLogs = () => {
    fetchSystemLogs();
  };

  return {
    logs,
    isLoading,
    filters,
    setFilters,
    refetchLogs
  };
}
