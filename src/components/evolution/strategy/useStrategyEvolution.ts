
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { Strategy, StrategyVersion } from '@/types/strategy';
import { useQuery } from '@tanstack/react-query';

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

export interface Contributor {
  id: string;
  name: string;
  count: number;
}

export interface UseStrategyEvolutionResult {
  isLoading: boolean;
  loading: boolean; // Added for backward compatibility
  strategyHistory: StrategyHistoryItem[];
  executionLogs: ExecutionLogItem[];
  userList: UserItem[];
  formatTimestamp: (date: string) => string;
  error: Error | null;
  // For backward compatibility with StrategyEvolutionTab.tsx
  history: StrategyHistoryItem[];
  logs: ExecutionLogItem[];
  userMap: {
    getUserName: (userId: string | null) => string;
  };
  formatDate: (date: string) => string;
  // Additional properties needed
  strategy: Strategy | null;
  versions: StrategyVersion[];
  contributors: Contributor[];
  latestVersion: StrategyVersion | null;
  averageExecutionTime: number | null;
  executionsCount: number;
  successRate: number;
  versionCount: number;
  refetch: () => Promise<void>;
}

export function useStrategyEvolution(strategyId: string): UseStrategyEvolutionResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [strategyHistory, setStrategyHistory] = useState<StrategyHistoryItem[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLogItem[]>([]);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Query for strategy details
  const strategyQuery = useQuery({
    queryKey: ['strategy', strategyId],
    queryFn: async (): Promise<Strategy | null> => {
      if (!strategyId || strategyId === 'default') return null;
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', strategyId)
        .single();
        
      if (error) throw new Error(`Error fetching strategy: ${error.message}`);
      return data as Strategy;
    },
    enabled: !!strategyId && strategyId !== 'default',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for strategy versions
  const versionsQuery = useQuery({
    queryKey: ['strategy-versions', strategyId],
    queryFn: async (): Promise<StrategyVersion[]> => {
      if (!strategyId || strategyId === 'default') return [];
      
      const { data, error } = await supabase
        .from('strategy_versions')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: false });
        
      if (error) throw new Error(`Error fetching strategy versions: ${error.message}`);
      return data as StrategyVersion[] || [];
    },
    enabled: !!strategyId && strategyId !== 'default',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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

        // Set strategy data if it was fetched successfully
        if (strategyQuery.data) {
          setStrategy(strategyQuery.data);
        }
      } catch (err) {
        console.error('Error fetching strategy evolution data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch strategy data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [strategyId, strategyQuery.data]);

  const formatTimestamp = (date: string) => {
    try {
      return format(new Date(date), 'PPpp');
    } catch (err) {
      return date;
    }
  };

  // Helper for backward compatibility
  const getUserName = (userId: string | null) => {
    if (!userId) return 'System';
    
    const user = userList.find(u => u.id === userId);
    if (user) {
      if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
      } else if (user.email) {
        return user.email;
      }
    }
    
    // Fallback to truncated ID
    return userId.substring(0, 8) + '...';
  };

  // Calculate additional statistics for the UI
  const computedStats = useMemo(() => {
    const totalExecutions = executionLogs.length;
    const successfulExecutions = executionLogs.filter(log => log.status === 'success').length;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    
    const executionTimes = executionLogs
      .filter(log => log.results?.execution_time_ms)
      .map(log => log.results.execution_time_ms);
    
    const avgExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : null;
    
    // Calculate contributors
    const contributorMap = new Map<string, number>();
    strategyHistory.forEach(item => {
      if (item.changed_by) {
        contributorMap.set(
          item.changed_by, 
          (contributorMap.get(item.changed_by) || 0) + 1
        );
      }
    });
    
    const contributors = Array.from(contributorMap.entries()).map(([id, count]) => ({
      id,
      name: getUserName(id),
      count
    }));
    
    const latestVersion = versionsQuery.data && versionsQuery.data.length > 0
      ? versionsQuery.data[0]
      : null;
    
    return {
      executionsCount: totalExecutions,
      successRate,
      averageExecutionTime: avgExecutionTime,
      contributors,
      latestVersion,
      versionCount: versionsQuery.data?.length || 0
    };
  }, [executionLogs, strategyHistory, versionsQuery.data, userList]);

  // Function to refetch all data
  const refetch = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        strategyQuery.refetch(),
        versionsQuery.refetch(),
        // Manually refetch the other data since they don't use react-query yet
        (async () => {
          const { data } = await supabase
            .from('strategy_history')
            .select('*')
            .eq('strategy_id', strategyId)
            .order('created_at', { ascending: false });
          
          setStrategyHistory(data || []);
        })(),
        (async () => {
          const { data } = await supabase
            .from('strategy_executions')
            .select('*')
            .eq('strategy_id', strategyId)
            .order('execution_time', { ascending: false });
          
          setExecutionLogs(data || []);
        })()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refetch data'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading: isLoading || strategyQuery.isLoading || versionsQuery.isLoading,
    loading: isLoading || strategyQuery.isLoading || versionsQuery.isLoading, // Backward compatibility
    strategyHistory,
    executionLogs,
    userList,
    formatTimestamp,
    error: error || strategyQuery.error || versionsQuery.error,
    // For backward compatibility
    history: strategyHistory,
    logs: executionLogs,
    userMap: { getUserName },
    formatDate: formatTimestamp,
    // Additional properties
    strategy: strategy || strategyQuery.data,
    versions: versionsQuery.data || [],
    ...computedStats,
    refetch
  };
}
