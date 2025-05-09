
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SystemEventModule, SystemEventType } from '@/types/shared';

export interface LogFilterState {
  moduleFilter: string;
  eventFilter: string;
  searchQuery: string;
  selectedDate: Date | null;
}

export function useSystemLogsData(tenantId: string | null) {
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [eventFilter, setEventFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [availableModules, setAvailableModules] = useState<SystemEventModule[]>([]);
  const [availableEvents, setAvailableEvents] = useState<SystemEventType[]>([]);
  
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['systemLogs', tenantId, moduleFilter, eventFilter, searchQuery, selectedDate],
    queryFn: async () => {
      if (!tenantId) return [];
      
      // First, fetch module and event types
      try {
        const { data: modules, error: modulesError } = await supabase
          .from('system_logs')
          .select('module')
          .eq('tenant_id', tenantId)
          .limit(100);
          
        if (!modulesError && modules) {
          const uniqueModules = Array.from(
            new Set(modules.map(item => item.module))
          ) as SystemEventModule[];
          setAvailableModules(uniqueModules);
        }
        
        const { data: events, error: eventsError } = await supabase
          .from('system_logs')
          .select('event')
          .eq('tenant_id', tenantId)
          .limit(100);
          
        if (!eventsError && events) {
          const uniqueEvents = Array.from(
            new Set(events.map(item => item.event))
          ) as SystemEventType[];
          setAvailableEvents(uniqueEvents);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
      
      // Now fetch logs with filters
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (moduleFilter) {
        query = query.eq('module', moduleFilter);
      }
      
      if (eventFilter) {
        query = query.eq('event', eventFilter);
      }
      
      if (searchQuery) {
        query = query.or(`context.ilike.%${searchQuery}%,event.ilike.%${searchQuery}%`);
      }
      
      if (selectedDate) {
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        query = query.gte('created_at', startDate.toISOString())
                     .lte('created_at', endDate.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching system logs:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!tenantId
  });
  
  const resetFilters = useCallback(() => {
    setModuleFilter('');
    setEventFilter('');
    setSearchQuery('');
    setSelectedDate(null);
  }, []);
  
  const handleFilterChange = useCallback((newFilters: LogFilterState) => {
    setModuleFilter(newFilters.moduleFilter);
    setEventFilter(newFilters.eventFilter);
    setSearchQuery(newFilters.searchQuery);
    setSelectedDate(newFilters.selectedDate);
  }, []);
  
  const handleViewDetails = useCallback((log: any) => {
    setSelectedLog(log);
  }, []);
  
  const closeLogDetails = useCallback(() => {
    setSelectedLog(null);
  }, []);
  
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    logs: logs || [],
    isLoading,
    moduleFilter,
    eventFilter,
    searchQuery,
    selectedDate,
    selectedLog,
    availableModules,
    availableEvents,
    resetFilters,
    handleFilterChange,
    handleViewDetails,
    closeLogDetails,
    handleRefresh
  };
}
