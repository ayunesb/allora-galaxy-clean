
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AuditLog } from '@/components/evolution/logs/AuditLogTable';
import { AuditLogFilters } from '@/components/evolution/logs/AuditLogFilters';

const useAuditLogData = (filters: AuditLogFilters = {}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { workspace } = useWorkspace();

  const fetchLogs = useCallback(async () => {
    if (!workspace?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', workspace.id)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.event) {
        query = query.eq('event', filters.event);
      }
      
      if (filters.search) {
        query = query.or(`event.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [workspace?.id, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = () => {
    fetchLogs();
  };

  return {
    logs,
    isLoading,
    error,
    handleRefresh
  };
};

export default useAuditLogData;
