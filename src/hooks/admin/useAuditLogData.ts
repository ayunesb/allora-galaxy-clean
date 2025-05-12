
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuditLog, SystemEventModule } from '@/types/logs';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from '@/components/ui/use-toast';

interface UseAuditLogDataOptions {
  limit?: number;
  module?: SystemEventModule;
}

export default function useAuditLogData(options: UseAuditLogDataOptions = {}) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();
  
  const fetchLogs = useCallback(async () => {
    if (!currentWorkspace?.id) {
      setLogs([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Build query
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', currentWorkspace.id)
        .order('created_at', { ascending: false });
      
      // Apply limit if provided
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // Apply module filter if provided
      if (options.module) {
        query = query.eq('module', options.module);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Map API data to AuditLog type
      const auditLogs: AuditLog[] = data.map((item: any) => ({
        id: item.id,
        module: item.module,
        event: item.event,
        action: item.action || item.event, // Use event as fallback for action
        user_id: item.user_id,
        tenant_id: item.tenant_id,
        created_at: item.created_at,
        context: item.context,
        // Handle any additional fields from the API
        entity_type: item.entity_type as SystemEventModule,
        entity_id: item.entity_id,
        event_type: item.event_type,
        description: item.description,
        metadata: item.metadata,
      }));
      
      setLogs(auditLogs);
    } catch (error: any) {
      console.error('Error fetching system logs:', error);
      toast({
        title: 'Error fetching logs',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id, options.limit, options.module]);
  
  const handleRefresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);
  
  // Fetch logs initially
  useState(() => {
    fetchLogs();
  });
  
  return { logs, isLoading, handleRefresh, fetchLogs };
}
