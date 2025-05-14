
import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { SystemEventModule, LogSeverity } from '@/types/shared';

export interface SystemLog {
  id: string;
  module: string;
  event: string;
  context: any;
  created_at: string;
  tenant_id?: string;
}

export function useSystemLogs(defaultLimit: number = 50) {
  const { currentWorkspace } = useWorkspace();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [limit, setLimit] = useState(defaultLimit);
  
  // Filter states
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch logs from the database
  const fetchSystemLogs = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', currentWorkspace.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      // Apply module filter if set
      if (moduleFilter) {
        query = query.eq('module', moduleFilter);
      }
      
      // Apply event filter if set
      if (eventFilter) {
        query = query.eq('event', eventFilter);
      }
      
      // Apply search filter if set
      if (searchTerm) {
        query = query.or(
          `module.ilike.%${searchTerm}%,event.ilike.%${searchTerm}%,context.ilike.%${searchTerm}%`
        );
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching system logs:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id, limit, moduleFilter, eventFilter, searchTerm]);

  // Fetch logs when dependencies change
  useEffect(() => {
    fetchSystemLogs();
  }, [fetchSystemLogs]);

  return {
    logs,
    isLoading,
    error,
    refresh: fetchSystemLogs,
    setModuleFilter,
    setEventFilter,
    setSearchTerm,
    setLimit,
    moduleFilter,
    eventFilter,
    searchTerm,
    limit
  };
}
