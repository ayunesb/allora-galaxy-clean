
import { useState, useEffect, useCallback } from 'react';
import { AuditLog, SystemLog } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface UseAuditLogDataReturn {
  logs: AuditLog[];
  isLoading: boolean;
  handleRefresh: () => void;
}

const useAuditLogData = (): UseAuditLogDataReturn => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentWorkspace } = useWorkspace();

  const fetchLogs = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error fetching audit logs:', error);
        return;
      }
      
      // Transform system_logs data to match AuditLog interface
      const transformedLogs: AuditLog[] = (data as SystemLog[]).map(log => ({
        id: log.id,
        entity_type: log.module || 'system',
        entity_id: log.id,
        user_id: log.tenant_id || '',
        event_type: log.event || 'unknown',
        description: log.context?.description || '',
        module: log.module,
        tenant_id: log.tenant_id,
        created_at: log.created_at,
        metadata: log.context,
      }));
      
      setLogs(transformedLogs);
    } catch (error) {
      console.error('Error in fetchLogs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    handleRefresh
  };
};

export default useAuditLogData;
