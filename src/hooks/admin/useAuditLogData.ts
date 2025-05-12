
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuditLog, LogFilters } from '@/types/logs';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export function useAuditLogData(initialFilters?: Partial<LogFilters>) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<LogFilters>({
    module: initialFilters?.module || null,
    event: initialFilters?.event || null,
    fromDate: initialFilters?.fromDate || null,
    toDate: initialFilters?.toDate || null,
    searchTerm: initialFilters?.searchTerm || '',
    limit: initialFilters?.limit || 100
  });
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();

  const fetchLogs = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', currentWorkspace.id)
        .order('created_at', { ascending: false });
      
      // Apply module filter if provided
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      // Apply event filter if provided
      if (filters.event) {
        query = query.eq('event', filters.event);
      }
      
      // Apply date range filters if provided
      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }
      
      if (filters.toDate) {
        query = query.lte('created_at', filters.toDate);
      }
      
      // Apply search term if provided
      if (filters.searchTerm) {
        query = query.or(`event.ilike.%${filters.searchTerm}%,context.ilike.%${filters.searchTerm}%`);
      }
      
      // Apply limit if provided
      query = query.limit(filters.limit || 100);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setLogs(data as AuditLog[]);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error fetching logs',
        description: error.message || 'Failed to load audit logs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentWorkspace?.id, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const updateFilters = (newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const refetch = () => {
    fetchLogs();
  };

  return {
    logs,
    isLoading,
    filters,
    updateFilters,
    setFilters: updateFilters,
    refetch
  };
}
