
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog } from '@/types/logs';
import { useToast } from '@/hooks/use-toast';
import { useTenantId } from '@/hooks/useTenantId';
import { DateRange } from '@/types/shared';

export const useSystemLogsData = () => {
  const { toast } = useToast();
  const tenantId = useTenantId();
  
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  
  // Filters
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<DateRange | null>(null);
  
  const fetchLogs = useCallback(async (filters?: {
    level?: string;
    module?: string;
    event?: string;
    searchQuery?: string;
    date?: DateRange | null;
  }) => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('system_logs')
        .select('*');
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      if (filters?.module && filters.module !== 'all') {
        query = query.eq('module', filters.module);
      }
      
      if (filters?.level && filters.level !== 'all') {
        query = query.eq('level', filters.level);
      }
      
      if (filters?.event && filters.event !== 'all') {
        query = query.eq('event', filters.event);
      }
      
      if (filters?.searchQuery) {
        query = query.ilike('description', `%${filters.searchQuery}%`);
      }
      
      if (filters?.date) {
        const { from, to } = filters.date;
        
        if (from) {
          const startDate = new Date(from);
          startDate.setHours(0, 0, 0, 0);
          query = query.gte('created_at', startDate.toISOString());
          
          if (to) {
            const endDate = new Date(to);
            endDate.setHours(23, 59, 59, 999);
            query = query.lte('created_at', endDate.toISOString());
          }
        }
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      setLogs(data as SystemLog[]);
      
      // Extract unique modules and events
      if (data) {
        const uniqueModules = [...new Set(data.map(log => log.module))];
        const uniqueEvents = [...new Set(data.map(log => log.event))];
        
        setModules(uniqueModules);
        setEvents(uniqueEvents);
      }
    } catch (error: any) {
      toast({
        title: 'Error fetching logs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, toast]);
  
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  
  const handleFilterChange = (filter: string, value: string | DateRange | null) => {
    if (filter === 'moduleFilter') {
      setModuleFilter(value as string);
    } else if (filter === 'eventFilter') {
      setEventFilter(value as string);
    } else if (filter === 'searchQuery') {
      setSearchQuery(value as string);
    } else if (filter === 'selectedDate') {
      setSelectedDate(value as DateRange | null);
    }
  };
  
  const handleResetFilters = () => {
    setModuleFilter('all');
    setEventFilter('all');
    setSearchQuery('');
    setSelectedDate(null);
  };
  
  const handleRefresh = () => {
    fetchLogs({
      module: moduleFilter,
      event: eventFilter,
      searchQuery: searchQuery,
      date: selectedDate
    });
  };
  
  return {
    logs,
    isLoading,
    moduleFilter,
    eventFilter,
    searchQuery,
    selectedDate,
    modules,
    events,
    handleFilterChange,
    handleResetFilters,
    handleRefresh,
  };
};
