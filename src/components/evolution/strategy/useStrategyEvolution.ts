
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface StrategyHistoryItem {
  id: string;
  strategy_id: string;
  change_type: string;
  changed_by: string;
  created_at: string;
  details?: any;
}

export interface ExecutionLogItem {
  id: string;
  strategy_id: string;
  execution_time: string;
  status: string;
  executed_by: string;
  results?: any;
  error?: string;
}

export interface UserItem {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface UseStrategyEvolutionResult {
  isLoading: boolean;
  strategyHistory: StrategyHistoryItem[];
  executionLogs: ExecutionLogItem[];
  userList: UserItem[];
  formatTimestamp: (date: string) => string;
  error: Error | null;
}

export function useStrategyEvolution(strategyId: string): UseStrategyEvolutionResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [strategyHistory, setStrategyHistory] = useState<StrategyHistoryItem[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLogItem[]>([]);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!strategyId || strategyId === 'default') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch strategy history
        const { data: historyData, error: historyError } = await supabase
          .from('strategy_history')
          .select('*')
          .eq('strategy_id', strategyId)
          .order('created_at', { ascending: false });

        if (historyError) throw historyError;
        setStrategyHistory(historyData || []);

        // Fetch execution logs
        const { data: logsData, error: logsError } = await supabase
          .from('strategy_executions')
          .select('*')
          .eq('strategy_id', strategyId)
          .order('execution_time', { ascending: false });

        if (logsError) throw logsError;
        setExecutionLogs(logsData || []);

        // Get unique user IDs from both datasets
        const userIds = new Set<string>();
        historyData?.forEach(item => item.changed_by && userIds.add(item.changed_by));
        logsData?.forEach(item => item.executed_by && userIds.add(item.executed_by));

        // Fetch user details if there are any user IDs
        if (userIds.size > 0) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name')
            .in('id', Array.from(userIds));

          if (userError) throw userError;
          setUserList(userData || []);
        }
      } catch (err) {
        console.error('Error fetching strategy evolution data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch strategy data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [strategyId]);

  const formatTimestamp = (date: string) => {
    try {
      return format(new Date(date), 'PPpp');
    } catch (err) {
      return date;
    }
  };

  return {
    isLoading,
    strategyHistory,
    executionLogs,
    userList,
    formatTimestamp,
    error
  };
}
