
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SystemLogFilter } from '@/types/shared';

interface SystemLog {
  id: string;
  module: string;
  event: string;
  created_at: string;
  context?: any;
}

export const useSystemLogsData = (filter: SystemLogFilter) => {
  const [data, setData] = useState<SystemLog[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSystemLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from Supabase
      // For demo purposes, we'll return mock data
      let mockLogs: SystemLog[] = [
        {
          id: '1',
          module: 'auth',
          event: 'user.login',
          created_at: new Date(Date.now() - 1000000).toISOString(),
          context: { user_id: 'usr123', ip: '192.168.1.1' }
        },
        {
          id: '2',
          module: 'agent',
          event: 'prompt.generated',
          created_at: new Date(Date.now() - 2000000).toISOString(),
          context: { agent_id: 'agent123', version: 'v2', tokens: 245 }
        },
        {
          id: '3',
          module: 'plugin',
          event: 'execution.failed',
          created_at: new Date(Date.now() - 3000000).toISOString(),
          context: { plugin_id: 'plugin123', error: 'Rate limit exceeded' }
        },
        {
          id: '4',
          module: 'strategy',
          event: 'execution.completed',
          created_at: new Date(Date.now() - 4000000).toISOString(),
          context: { strategy_id: 'strat123', duration_ms: 2540 }
        },
        {
          id: '5',
          module: 'system',
          event: 'backup.completed',
          created_at: new Date(Date.now() - 5000000).toISOString(),
          context: { size_mb: 125, files: 1240 }
        },
        {
          id: '6',
          module: 'agent',
          event: 'decision.made',
          created_at: new Date(Date.now() - 6000000).toISOString(),
          context: { agent_id: 'agent456', decision: 'approve', confidence: 0.92 }
        },
        {
          id: '7',
          module: 'auth',
          event: 'user.created',
          created_at: new Date(Date.now() - 7000000).toISOString(),
          context: { user_id: 'usr456', email: 'user@example.com' }
        }
      ];
      
      // Apply filters
      if (filter.module) {
        mockLogs = mockLogs.filter(log => log.module === filter.module);
      }
      
      if (filter.event) {
        mockLogs = mockLogs.filter(log => log.event === filter.event);
      }
      
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        mockLogs = mockLogs.filter(log => 
          log.module.toLowerCase().includes(searchTerm) || 
          log.event.toLowerCase().includes(searchTerm) ||
          JSON.stringify(log.context).toLowerCase().includes(searchTerm)
        );
      }
      
      // Extract unique modules and events for filters
      const uniqueModules = Array.from(new Set(mockLogs.map(log => log.module)));
      const uniqueEvents = Array.from(new Set(mockLogs.map(log => log.event)));
      
      setModules(uniqueModules);
      setEvents(uniqueEvents);
      setData(mockLogs);
    } catch (err: any) {
      console.error('Error fetching system logs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSystemLogs();
  }, [fetchSystemLogs]);

  const refresh = useCallback(async () => {
    await fetchSystemLogs();
  }, [fetchSystemLogs]);

  return {
    data,
    isLoading,
    error,
    modules,
    events,
    refresh
  };
};
