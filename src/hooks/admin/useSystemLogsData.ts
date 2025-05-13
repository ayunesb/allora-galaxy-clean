
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { SystemLog } from '@/types/logs';

interface SystemLogFilters {
  searchTerm?: string;
  module?: string;
  event?: string;
  fromDate?: Date | null;
  toDate?: Date | null;
  limit?: number;
}

export const useSystemLogsData = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SystemLogFilters>({
    searchTerm: '',
    module: '',
    event: '',
    fromDate: null,
    toDate: null,
    limit: 100,
  });

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.module) {
        query = query.eq('module', filters.module);
      }

      if (filters.event) {
        query = query.eq('event', filters.event);
      }

      if (filters.searchTerm) {
        query = query.or(`event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%`);
      }

      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate.toISOString());
      }

      if (filters.toDate) {
        const endDate = new Date(filters.toDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString());
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setLogs(data as SystemLog[]);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch logs';
      setError(errorMessage);
      toast({
        title: 'Error loading logs',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<SystemLogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    logs,
    isLoading,
    error,
    filters,
    updateFilters,
    fetchLogs,
  };
};

export default useSystemLogsData;
