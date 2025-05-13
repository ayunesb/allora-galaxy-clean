
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuditLog, AuditLogFilterState } from '@/types/logs';
import { useTenantId } from '@/hooks/useTenantId';
import { supabase } from '@/lib/supabase';

export const useAuditLogData = () => {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditLogFilterState>({
    module: '',
    event: '',
    fromDate: null,
    toDate: null,
    searchTerm: ''
  });

  // Fetch logs with current filters
  const fetchLogs = async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create query
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters  
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.event) {
        query = query.eq('event', filters.event);
      }
      
      if (filters.searchTerm) {
        query = query.or(`module.ilike.%${filters.searchTerm}%,event.ilike.%${filters.searchTerm}%`);
      }
      
      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate.toISOString());
      }
      
      if (filters.toDate) {
        const endDate = new Date(filters.toDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lte('created_at', endDate.toISOString());
      }
      
      // Execute query
      const { data, error } = await query.limit(100);
      
      if (error) {
        throw error;
      }
      
      // Transform system logs to audit logs
      const auditLogs: AuditLog[] = (data || []).map(log => ({
        id: log.id,
        user_id: log.context?.user_id || 'system',
        action: log.event,
        entity_type: log.module,
        entity_id: log.context?.resource_id || '',
        details: log.context || {},
        created_at: log.created_at,
        tenant_id: log.tenant_id,
        module: log.module,
        event: log.event,
        context: log.context
      }));
      
      setLogs(auditLogs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch logs');
      toast({
        title: 'Error loading logs',
        description: 'There was a problem loading the audit logs.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (tenantId) {
      fetchLogs();
    }
  }, [tenantId]);

  // Refetch when filters change
  useEffect(() => {
    if (tenantId) {
      fetchLogs();
    }
  }, [filters, tenantId]);

  const handleFilterChange = (newFilters: AuditLogFilterState) => {
    setFilters(newFilters);
  };

  return {
    logs,
    isLoading,
    error,
    filters,
    setFilters: handleFilterChange,
    refetch: fetchLogs
  };
};

export default useAuditLogData;
