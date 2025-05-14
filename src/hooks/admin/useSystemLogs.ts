
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog } from '@/types/logs';
import { SystemEventType } from '@/types/logs';

export const useSystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchLogs = async (options: {
    limit?: number;
    module?: string;
    eventType?: SystemEventType;
    fromDate?: string;
    toDate?: string;
  } = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.module) {
        query = query.eq('module', options.module);
      }
      
      if (options.eventType) {
        query = query.eq('event_type', options.eventType);
      }
      
      if (options.fromDate) {
        query = query.gte('created_at', options.fromDate);
      }
      
      if (options.toDate) {
        query = query.lte('created_at', options.toDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform to match the SystemLog interface
      const systemLogs: SystemLog[] = (data || []).map(item => ({
        id: item.id,
        created_at: item.created_at,
        timestamp: item.created_at,
        description: item.description,
        message: item.message || item.description,
        level: item.level || 'info',
        module: item.module,
        event: item.event,
        event_type: item.event_type || 'info',
        metadata: item.metadata || {},
        context: item.context || '',
        tenant_id: item.tenant_id,
        status: item.status,
        severity: item.severity || 'medium',
        error_type: item.error_type || 'unknown',
      }));
      
      setLogs(systemLogs);
      return systemLogs;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Error fetching system logs:', err);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    logs,
    isLoading,
    error,
    fetchLogs,
  };
};

export default useSystemLogs;
