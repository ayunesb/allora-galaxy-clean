
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/lib/notifications/toast';
import type { Strategy, StrategyVersion } from '@/types/strategy';

interface UseStrategyEvolutionResult {
  isLoading: boolean;
  error: Error | null;
  strategy: Strategy | null;
  versions: StrategyVersion[];
  contributors: { id: string; name: string; count: number }[];
  latestVersion: StrategyVersion | null;
  averageExecutionTime: number | null;
  executionsCount: number;
  successRate: number;
  versionCount: number;
  refetch: () => Promise<void>;
}

export function useStrategyEvolution(strategyId: string): UseStrategyEvolutionResult {
  const [error, setError] = useState<Error | null>(null);

  // Fetch strategy data
  const strategyQuery = useQuery({
    queryKey: ['strategy-evolution', strategyId],
    queryFn: async (): Promise<Strategy> => {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', strategyId)
        .single();
        
      if (error) {
        throw new Error(`Error fetching strategy: ${error.message}`);
      }
      
      return data as Strategy;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch strategy versions
  const versionsQuery = useQuery({
    queryKey: ['strategy-evolution-versions', strategyId],
    queryFn: async (): Promise<StrategyVersion[]> => {
      const { data, error } = await supabase
        .from('strategy_versions')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw new Error(`Error fetching strategy versions: ${error.message}`);
      }
      
      return data as StrategyVersion[];
    },
    enabled: !!strategyQuery.data,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch execution statistics
  const executionStatsQuery = useQuery({
    queryKey: ['strategy-execution-stats', strategyId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_strategy_execution_stats', {
        strategy_id_param: strategyId
      });
      
      if (error) {
        throw new Error(`Error fetching execution stats: ${error.message}`);
      }
      
      return data || {
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        avg_execution_time: 0
      };
    },
    enabled: !!strategyQuery.data,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch contributors data
  const contributorsQuery = useQuery({
    queryKey: ['strategy-contributors', strategyId],
    queryFn: async () => {
      // Get unique contributors from versions
      const { data, error } = await supabase
        .from('strategy_versions')
        .select('created_by')
        .eq('strategy_id', strategyId);
        
      if (error) {
        throw new Error(`Error fetching contributors: ${error.message}`);
      }

      // Count unique contributors and fetch their names
      const contributorIds = [...new Set(data.map(v => v.created_by))];
      
      if (contributorIds.length === 0) {
        return [];
      }
      
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, display_name, email')
        .in('id', contributorIds);
        
      if (usersError) {
        throw new Error(`Error fetching contributor details: ${usersError.message}`);
      }
      
      // Create contributor objects with counts
      return contributorIds.map(id => {
        const user = users?.find(u => u.id === id);
        const count = data.filter(v => v.created_by === id).length;
        
        return {
          id,
          name: user?.display_name || user?.email || 'Unknown User',
          count
        };
      }).sort((a, b) => b.count - a.count);
    },
    enabled: versionsQuery.isSuccess && (versionsQuery.data?.length || 0) > 0,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Process all queries
  const isLoading = strategyQuery.isLoading || versionsQuery.isLoading || 
                    executionStatsQuery.isLoading || contributorsQuery.isLoading;

  // Combine errors
  if (strategyQuery.isError || versionsQuery.isError || 
      executionStatsQuery.isError || contributorsQuery.isError) {
    const actualError = 
      strategyQuery.error || 
      versionsQuery.error || 
      executionStatsQuery.error || 
      contributorsQuery.error;
      
    if (actualError && (!error || error.message !== actualError.message)) {
      setError(actualError instanceof Error ? actualError : new Error(String(actualError)));
      
      notify({ 
        title: 'Error loading evolution data',
        description: actualError instanceof Error ? actualError.message : String(actualError)
      }, { type: 'error' });
    }
  }

  // Calculate derived values
  const versions = versionsQuery.data || [];
  const latestVersion = versions.length > 0 ? versions[0] : null;
  const stats = executionStatsQuery.data || {
    total_executions: 0,
    successful_executions: 0,
    failed_executions: 0,
    avg_execution_time: 0
  };
  
  const executionsCount = stats.total_executions || 0;
  const successRate = executionsCount > 0 
    ? (stats.successful_executions / executionsCount) * 100 
    : 0;
  const averageExecutionTime = stats.avg_execution_time || null;

  // Combined refetch function
  const refetch = async () => {
    try {
      await Promise.all([
        strategyQuery.refetch(),
        versionsQuery.refetch(),
        executionStatsQuery.refetch(),
        contributorsQuery.refetch()
      ]);
      
      notify({ title: 'Evolution data refreshed' });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(new Error(errorMessage));
      
      notify({ 
        title: 'Error refreshing data',
        description: errorMessage
      }, { type: 'error' });
    }
  };

  return {
    isLoading,
    error,
    strategy: strategyQuery.data || null,
    versions,
    contributors: contributorsQuery.data || [],
    latestVersion,
    averageExecutionTime,
    executionsCount,
    successRate,
    versionCount: versions.length,
    refetch
  };
}
