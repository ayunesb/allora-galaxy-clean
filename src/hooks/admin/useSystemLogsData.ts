
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SystemLogFilter } from '@/components/admin/logs/SystemLogFilters';
import { AuditLog } from '@/types/logs';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';

export const useSystemLogsData = () => {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modules, setModules] = useState<string[]>([]);
  const [filters, setFilters] = useState<SystemLogFilter>({
    searchTerm: '',
  });
  
  const fetchModules = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('module')
        .eq('tenant_id', currentWorkspace.id)
        .order('module')
        .limit(100);
      
      if (error) throw error;
      
      // Extract unique modules
      const uniqueModules = Array.from(new Set(data.map(item => item.module)));
      setModules(uniqueModules);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchLogs = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', currentWorkspace.id);
      
      // Apply filters
      if (filters.searchTerm) {
        query = query.or(`event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%`);
      }
      
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.dateRange?.from) {
        const fromDate = filters.dateRange.from;
        query = query.gte('created_at', fromDate.toISOString());
        
        if (filters.dateRange.to) {
          const toDate = filters.dateRange.to;
          query = query.lte('created_at', toDate.toISOString());
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
      
      if (error) {
        throw error;
      }
      
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching system logs:', error);
      toast({
        title: "Error fetching system logs",
        description: error.message || "Failed to load system logs",
        variant: "destructive"
      });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, filters, toast]);

  // Initial data fetching
  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchLogs();
      fetchModules();
    }
  }, [currentWorkspace?.id, fetchLogs]);

  const handleFilterChange = (newFilters: SystemLogFilter) => {
    setFilters(newFilters);
  };

  return {
    logs,
    loading,
    filters,
    modules,
    fetchLogs,
    handleFilterChange,
  };
};
