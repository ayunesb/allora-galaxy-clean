
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { DateRange, LogSeverity } from '@/types/shared';

export interface SystemLog {
  id: string;
  module: string;
  event: string;
  created_at: string;
  context?: Record<string, any>;
  tenant_id?: string;
}

export interface SystemLogFilter {
  searchTerm: string;
  module?: string;
  severity?: LogSeverity;
  dateRange?: DateRange;
}

export function useSystemLogsData(initialFilters: SystemLogFilter = { searchTerm: '' }) {
  const { currentWorkspace } = useWorkspace();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SystemLogFilter>(initialFilters);
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  // Fetch logs based on current filters
  const fetchLogs = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    setLoading(true);
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply tenant filter
      query = query.eq('tenant_id', currentWorkspace.id);

      // Apply module filter if specified
      if (filters.module) {
        query = query.eq('module', filters.module);
      }

      // Apply severity/event filter if specified
      if (filters.severity) {
        query = query.eq('event', filters.severity);
      }

      // Apply date range filter if specified
      if (filters.dateRange?.from) {
        const fromDate = filters.dateRange.from.toISOString();
        query = query.gte('created_at', fromDate);

        if (filters.dateRange.to) {
          const toDate = filters.dateRange.to.toISOString();
          query = query.lte('created_at', toDate);
        }
      }

      // Execute the query
      const { data, error } = await query.limit(100);

      if (error) throw error;

      // Filter by search term if specified
      let filteredData = data || [];
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter(log => {
          const contextStr = log.context ? JSON.stringify(log.context).toLowerCase() : '';
          return (
            log.module.toLowerCase().includes(searchLower) ||
            log.event.toLowerCase().includes(searchLower) ||
            contextStr.includes(searchLower)
          );
        });
      }

      setLogs(filteredData);
    } catch (error) {
      console.error('Error fetching system logs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, filters]);

  // Fetch all available modules for filtering
  const fetchModules = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('module')
        .eq('tenant_id', currentWorkspace.id)
        .order('module');

      if (error) throw error;

      // Extract unique modules
      const modules = [...new Set(data?.map(item => item.module))];
      setAvailableModules(modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  }, [currentWorkspace?.id]);

  // Fetch data on initial load and when workspace changes
  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchLogs();
      fetchModules();
    }
  }, [currentWorkspace?.id, fetchLogs, fetchModules]);

  // Update filters
  const updateFilters = (newFilters: SystemLogFilter) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Refresh logs
  const refresh = async () => {
    await fetchLogs();
  };

  return {
    logs,
    loading,
    filters,
    availableModules,
    selectedLog,
    setSelectedLog,
    updateFilters,
    refresh
  };
}
