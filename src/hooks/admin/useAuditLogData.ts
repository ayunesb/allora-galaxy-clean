
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { SystemEventModule, SystemEventType } from '@/types/shared';

export interface AuditLogFilterState {
  moduleFilter: string;
  eventFilter: string;
  searchQuery: string;
  selectedDate: Date | null;
}

export function useAuditLogData() {
  const tenantId = useTenantId();
  
  // Log filter states
  const [moduleFilter, setModuleFilter] = React.useState<string>('');
  const [eventFilter, setEventFilter] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedLog, setSelectedLog] = React.useState<any | null>(null);
  
  // Available modules and events for filters
  const [availableModules, setAvailableModules] = React.useState<SystemEventModule[]>([]);
  const [availableEvents, setAvailableEvents] = React.useState<SystemEventType[]>([]);
  
  // Fetch system logs
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['auditLogs', tenantId, moduleFilter, eventFilter, searchQuery, selectedDate],
    queryFn: async () => {
      if (!tenantId) return [];
      
      try {
        // First, fetch module and event types if not loaded
        if (availableModules.length === 0) {
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
        }
        
        if (availableEvents.length === 0) {
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
        .limit(50);
      
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
  
  const resetFilters = React.useCallback(() => {
    setModuleFilter('');
    setEventFilter('');
    setSearchQuery('');
    setSelectedDate(null);
  }, []);
  
  const handleFilterChange = React.useCallback((newFilters: AuditLogFilterState) => {
    setModuleFilter(newFilters.moduleFilter);
    setEventFilter(newFilters.eventFilter);
    setSearchQuery(newFilters.searchQuery);
    setSelectedDate(newFilters.selectedDate);
  }, []);
  
  const handleViewDetails = React.useCallback((log: any) => {
    setSelectedLog(log);
  }, []);
  
  const closeLogDetails = React.useCallback(() => {
    setSelectedLog(null);
  }, []);
  
  const handleRefresh = React.useCallback(() => {
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
