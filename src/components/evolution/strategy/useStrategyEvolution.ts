
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Strategy } from '@/types/strategy';
import { format } from 'date-fns';

interface StrategyEvolutionResult {
  loading: boolean;
  strategy: Strategy | null;
  history: any[];
  logs: any[];
  userMap: Record<string, any>;
  formatDate: (dateStr: string) => string;
  error: Error | null;
}

export function useStrategyEvolution(strategyId: string): StrategyEvolutionResult {
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, any>>({});
  const [error, setError] = useState<Error | null>(null);

  // Format date helper
  const formatDate = useCallback((dateStr: string): string => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy HH:mm:ss');
    } catch (error) {
      return dateStr;
    }
  }, []);

  // Fetch strategy and related data
  useEffect(() => {
    const fetchStrategyData = async () => {
      if (!strategyId || strategyId === 'default') {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Fetch strategy details
        const { data: strategyData, error: strategyError } = await supabase
          .from('strategies')
          .select('*')
          .eq('id', strategyId)
          .maybeSingle();
          
        if (strategyError) throw strategyError;
        
        if (strategyData) {
          const typedStrategy: Strategy = {
            id: strategyData.id,
            tenant_id: strategyData.tenant_id || '',
            title: strategyData.title || '',
            description: strategyData.description || '',
            status: (strategyData.status as Strategy['status']) || 'draft',
            created_by: strategyData.created_by || '',
            created_at: strategyData.created_at || '',
            approved_by: strategyData.approved_by || null,
            approved_at: strategyData.approved_at || null,
            rejected_by: strategyData.rejected_by || null,
            rejected_at: strategyData.rejected_at || null,
            priority: strategyData.priority as Strategy['priority'] || null,
            tags: strategyData.tags || null,
            completion_percentage: strategyData.completion_percentage || null,
            due_date: strategyData.due_date || null,
            updated_at: strategyData.updated_at || null,
            metadata: strategyData.metadata || null
          };
          
          setStrategy(typedStrategy);
        }
        
        // Fetch strategy execution logs
        const { data: executionLogs, error: logsError } = await supabase
          .from('executions')
          .select('*')
          .eq('strategy_id', strategyId)
          .order('created_at', { ascending: false });
          
        if (logsError) throw logsError;
        
        setLogs(executionLogs || []);
        
        // Fetch system logs related to this strategy
        const { data: systemLogs, error: systemLogsError } = await supabase
          .from('system_logs')
          .select('*')
          .eq('module', 'strategy')
          .contains('context', { strategy_id: strategyId })
          .order('created_at', { ascending: false });
          
        if (systemLogsError) throw systemLogsError;
        
        setHistory(systemLogs || []);
        
        // Collect all user IDs to fetch user info
        const userIds = new Set<string>();
        if (strategyData?.created_by) userIds.add(strategyData.created_by);
        if (strategyData?.approved_by) userIds.add(strategyData.approved_by);
        
        executionLogs?.forEach(log => {
          if (log.executed_by) userIds.add(log.executed_by);
        });
        
        if (userIds.size > 0) {
          // Fetch user profiles
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url')
            .in('id', Array.from(userIds));
            
          if (usersError) throw usersError;
          
          // Create a map of user IDs to user info
          const usersMap: Record<string, any> = {};
          users?.forEach(user => {
            usersMap[user.id] = user;
          });
          
          setUserMap(usersMap);
        }
      } catch (err: any) {
        console.error('Error fetching strategy evolution data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStrategyData();
  }, [strategyId]);

  return {
    loading,
    strategy,
    history,
    logs,
    userMap,
    formatDate,
    error
  };
}
