
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/context/WorkspaceContext';
import { toast } from '@/components/ui/use-toast';

interface AuditLog {
  id: string;
  module: string;
  event: string;
  context?: Record<string, any>;
  created_at: string;
}

export interface AuditLogFilterState {
  moduleFilter: string;
  eventFilter: string;
  searchQuery: string;
  selectedDate: Date | null;
}

export const useAuditLogData = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);

  const { currentWorkspace } = useWorkspace();
  const tenantId = currentWorkspace?.id;

  // Fetch logs with applied filters
  const fetchLogs = useCallback(async () => {
    if (!tenantId) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

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
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
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
  const handleFilterChange = (filters: AuditLogFilterState) => {
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

  const handleViewDetails = (log: AuditLog) => {
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

export default useAuditLogData;
