
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuditLog, LogFilters } from '@/types/logs';
import { useTenantId } from '@/hooks/useTenantId';

export const useAuditLogData = () => {
  const { id: tenantId } = useTenantId();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<LogFilters>({
    module: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    search: '',
    page: 1,
    limit: 50,
  });
  
  const fetchLogs = useCallback(async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(filters.limit || 50);
      
      if (filters.event) {
        query = query.eq('event', filters.event);
      }
      
      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }
      
      if (filters.toDate) {
        query = query.lte('created_at', filters.toDate);
      }
      
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.searchTerm) {
        query = query.or(`description.ilike.%${filters.searchTerm}%,context.ilike.%${filters.searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform to match the AuditLog interface
      const auditLogs: AuditLog[] = (data || []).map(item => ({
        id: item.id,
        timestamp: item.created_at,
        description: item.description,
        message: item.message || item.description,
        level: item.level || 'info',
        module: item.module,
        event: item.event,
        event_type: item.event_type || 'info',
        status: item.status || 'info',
        metadata: item.metadata || {},
        context: item.context || {},
        created_at: item.created_at,
        tenant_id: item.tenant_id,
      }));
      
      setLogs(auditLogs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, filters]);
  
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  
  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  return {
    logs,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch: fetchLogs,
  };
};

export default useAuditLogData;
