
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog } from '@/pages/admin/SystemLogs';
import { useToast } from '@/hooks/use-toast';
import { useTenantId } from '@/hooks/useTenantId';

export const useSystemLogsData = () => {
  const { toast } = useToast();
  const tenantId = useTenantId();
  
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  
  // Filters
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [eventFilter, setEventFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('system_logs')
        .select('*');
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      if (moduleFilter) {
        query = query.eq('module', moduleFilter);
      }
      
      if (eventFilter) {
        query = query.eq('type', eventFilter);
      }
      
      if (searchQuery) {
        query = query.ilike('description', `%${searchQuery}%`);
      }
      
      if (selectedDate) {
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        query = query
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
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
        const uniqueEvents = [...new Set(data.map(log => log.type))];
        
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
  }, [tenantId, moduleFilter, eventFilter, searchQuery, selectedDate, toast]);
  
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  
  const handleFilterChange = (filter: string, value: string | Date | null) => {
    if (filter === 'moduleFilter') {
      setModuleFilter(value as string);
    } else if (filter === 'eventFilter') {
      setEventFilter(value as string);
    } else if (filter === 'searchQuery') {
      setSearchQuery(value as string);
    } else if (filter === 'selectedDate') {
      setSelectedDate(value as Date | null);
    } else if (filter === 'refresh') {
      fetchLogs();
    }
  };
  
  const handleResetFilters = () => {
    setModuleFilter('');
    setEventFilter('');
    setSearchQuery('');
    setSelectedDate(null);
  };
  
  const handleRefresh = () => {
    fetchLogs();
  };
  
  return {
    logs,
    isLoading,
    moduleFilter,
    eventFilter,
    searchQuery,
    selectedDate,
    selectedLog,
    modules,
    events,
    handleFilterChange,
    handleResetFilters,
    handleRefresh,
  };
};
