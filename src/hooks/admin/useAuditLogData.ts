
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AuditLogFilter } from '@/components/evolution/logs/AuditLogFilters';
import { AuditLog, SystemEventModule } from '@/types/logs';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';

export interface AuditLogDataParams {
  initialFilters?: AuditLogFilter;
  includeModules?: SystemEventModule[];
  excludeModules?: SystemEventModule[];
}

export const useAuditLogData = (params?: AuditLogDataParams) => {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modules, setModules] = useState<SystemEventModule[]>([]);
  const [filters, setFilters] = useState<AuditLogFilter>(
    params?.initialFilters || { searchTerm: '' }
  );
  
  const fetchModules = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      let query = supabase
        .from('system_logs')
        .select('module')
        .eq('tenant_id', currentWorkspace.id);
      
      if (params?.includeModules && params.includeModules.length > 0) {
        query = query.in('module', params.includeModules);
      }
      
      if (params?.excludeModules && params.excludeModules.length > 0) {
        query = query.not('module', 'in', `(${params.excludeModules.join(',')})`);
      }
      
      const { data, error } = await query.order('module').limit(100);
      
      if (error) throw error;
      
      // Extract unique modules
      const uniqueModules = Array.from(
        new Set(data.map(item => item.module))
      ) as SystemEventModule[];
      
      setModules(uniqueModules);
    } catch (error) {
      console.error('Error fetching log modules:', error);
    }
  };

  const fetchLogs = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', currentWorkspace.id);
      
      // Apply inclusion/exclusion filters from params
      if (params?.includeModules && params.includeModules.length > 0) {
        query = query.in('module', params.includeModules);
      }
      
      if (params?.excludeModules && params.excludeModules.length > 0) {
        query = query.not('module', 'in', `(${params.excludeModules.join(',')})`);
      }
      
      // Apply user filters
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
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error fetching logs",
        description: error.message || "Failed to load log data",
        variant: "destructive"
      });
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id, filters, params?.includeModules, params?.excludeModules, toast]);

  // Initial data fetching
  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchLogs();
      fetchModules();
    }
  }, [currentWorkspace?.id, fetchLogs]);

  const handleFilterChange = (newFilters: AuditLogFilter) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  return {
    logs,
    isLoading,
    filters,
    modules,
    fetchLogs,
    handleRefresh,
    handleFilterChange,
  };
};
