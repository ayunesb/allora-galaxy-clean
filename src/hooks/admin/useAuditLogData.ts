
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AuditLog } from '@/types/logs';
import { AuditLogFilterState } from '@/components/evolution/logs/AuditLogFilters';

export const useAuditLogData = (filters: AuditLogFilterState = {}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { currentWorkspace } = useWorkspace();

  const fetchLogs = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setLogs([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.module) {
        query = query.eq('module', filters.module);
      }

      if (filters.searchTerm) {
        query = query.or(`context.ilike.%${filters.searchTerm}%,event.ilike.%${filters.searchTerm}%`);
      }

      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
        
        if (filters.dateRange.to) {
          query = query.lte('created_at', filters.dateRange.to.toISOString());
        }
      }

      const { data, error } = await query.limit(100);

      if (error) {
        throw new Error(error.message);
      }

      setLogs(data as AuditLog[]);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    error,
    refetch: fetchLogs,
  };
};
