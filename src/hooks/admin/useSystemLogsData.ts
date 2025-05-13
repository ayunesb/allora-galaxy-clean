
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SystemLog, LogFilters } from '@/types';

export const useSystemLogsData = (initialFilters: LogFilters = {}) => {
  const [filters, setFilters] = useState<LogFilters>(initialFilters);
  
  // Fetch system logs
  const {
    data: logs,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['systemLogs', filters],
    queryFn: async () => {
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
        query = query.or(`event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }
      
      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate.toISOString());
      }
      
      if (filters.toDate) {
        // Add 1 day to include the entire day
        const endDate = new Date(filters.toDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString());
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SystemLog[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch modules for filter
  const { data: modules = [] } = useQuery({
    queryKey: ['logModules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('module')
        .order('module')
        .distinct();
      if (error) throw error;
      return data.map(item => item.module);
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
  
  // Fetch events for filter
  const { data: events = [] } = useQuery({
    queryKey: ['logEvents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('event')
        .order('event')
        .distinct();
      if (error) throw error;
      return data.map(item => item.event);
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
  
  return {
    logs,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
    modules,
    events
  };
};
