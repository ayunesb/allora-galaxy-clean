
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuditLog } from '@/types/logs';
import { useToast } from '@/hooks/use-toast';
import { useTenantId } from '@/hooks/useTenantId';
import { DateRange } from '@/types/shared';

export interface AuditLogFilter {
  searchTerm?: string;
  module?: string;
  action?: string;
  dateRange?: DateRange;
  userId?: string;
}

export function useAuditLogData() {
  const { toast } = useToast();
  const tenantId = useTenantId();
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modules, setModules] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  
  // Filters
  const [filters, setFilters] = useState<AuditLogFilter>({
    searchTerm: '',
  });

  const fetchMetadata = useCallback(async () => {
    if (!tenantId) return;
    
    try {
      // Fetch unique modules
      const { data: moduleData, error: moduleError } = await supabase
        .from('audit_logs')
        .select('module')
        .eq('tenant_id', tenantId)
        .order('module');
      
      if (moduleError) throw moduleError;
      
      // Fetch unique actions
      const { data: actionData, error: actionError } = await supabase
        .from('audit_logs')
        .select('action')
        .eq('tenant_id', tenantId)
        .order('action');
      
      if (actionError) throw actionError;
      
      // Extract unique values
      const uniqueModules = Array.from(new Set(moduleData.map(item => item.module).filter(Boolean)));
      const uniqueActions = Array.from(new Set(actionData.map(item => item.action).filter(Boolean)));
      
      setModules(uniqueModules);
      setActions(uniqueActions);
    } catch (error: any) {
      console.error('Error fetching metadata:', error);
    }
  }, [tenantId]);

  const fetchLogs = useCallback(async () => {
    if (!tenantId) return;
    
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('tenant_id', tenantId);
      
      // Apply filters
      if (filters.searchTerm) {
        query = query.or(
          `event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%,resource_type.ilike.%${filters.searchTerm}%`
        );
      }
      
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters.dateRange?.from) {
        const fromDate = new Date(filters.dateRange.from);
        query = query.gte('created_at', fromDate.toISOString());
        
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
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
      toast({
        title: 'Error fetching audit logs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, filters, toast]);

  useEffect(() => {
    if (tenantId) {
      fetchLogs();
      fetchMetadata();
    }
  }, [tenantId, fetchLogs, fetchMetadata]);

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
    actions,
    handleFilterChange,
    handleRefresh,
  };
}
