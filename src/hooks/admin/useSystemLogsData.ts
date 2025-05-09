
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SystemLog {
  id: string;
  module: string;
  event: string;
  context?: Record<string, any>;
  created_at: string;
  tenant_id?: string;
}

export interface LogFilterState {
  moduleFilter: string;
  eventFilter: string;
  searchQuery: string;
  selectedDate: Date | null;
}

export const useSystemLogsData = (tenantId?: string) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);

  // Fetch logs with applied filters
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);

    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by tenant if specified
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      // Apply module filter
      if (moduleFilter !== 'all') {
        query = query.eq('module', moduleFilter);
      }

      // Apply event filter
      if (eventFilter !== 'all') {
        query = query.eq('event', eventFilter);
      }

      // Apply search filter (across multiple fields)
      if (searchQuery) {
        query = query.or(`module.ilike.%${searchQuery}%,event.ilike.%${searchQuery}%`);
      }

      // Apply date filter
      if (selectedDate) {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query.gte('created_at', startOfDay.toISOString())
                     .lte('created_at', endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setLogs(data || []);

      // Extract unique modules and events for filter dropdowns
      if (data && data.length > 0) {
        const modules = [...new Set(data.map(log => log.module))];
        const events = [...new Set(data.map(log => log.event))];
        setAvailableModules(modules);
        setAvailableEvents(events);
      }

    } catch (error: any) {
      console.error('Error fetching system logs:', error);
      toast({
        title: "Error",
        description: "Failed to load system logs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, moduleFilter, eventFilter, searchQuery, selectedDate]);

  // Initial load and when dependencies change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filter handlers
  const handleFilterChange = (filters: LogFilterState) => {
    setModuleFilter(filters.moduleFilter);
    setEventFilter(filters.eventFilter);
    setSearchQuery(filters.searchQuery);
    setSelectedDate(filters.selectedDate);
  };

  const resetFilters = () => {
    setModuleFilter('all');
    setEventFilter('all');
    setSearchQuery('');
    setSelectedDate(null);
  };

  const handleViewDetails = (log: SystemLog) => {
    setSelectedLog(log);
  };

  const closeLogDetails = () => {
    setSelectedLog(null);
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
    availableModules,
    availableEvents,
    handleFilterChange,
    resetFilters,
    handleViewDetails,
    closeLogDetails,
    handleRefresh
  };
};

export default useSystemLogsData;
