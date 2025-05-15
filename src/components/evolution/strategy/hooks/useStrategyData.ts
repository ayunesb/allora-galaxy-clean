
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/lib/notifications/toast';
import type { Strategy, StrategyVersion, StrategyExecution } from '@/types/strategy';

interface StrategyDataResult {
  strategy: UseQueryResult<Strategy | null>;
  versions: UseQueryResult<StrategyVersion[]>;
  executions: UseQueryResult<StrategyExecution[]>;
  refetch: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
}

export const useStrategyData = (strategyId: string): StrategyDataResult => {
  // Query for the strategy details
  const strategyQuery = useQuery({
    queryKey: ['strategy', strategyId],
    queryFn: async (): Promise<Strategy | null> => {
      const { data, error } = await supabase
        .from('strategies')
        .select('*, created_by_user:created_by(*)')
        .eq('id', strategyId)
        .single();
        
      if (error) {
        throw new Error(`Error fetching strategy: ${error.message}`);
      }
      
      if (!data) {
        return null;
      }
      
      // Transform the data to match Strategy interface
      return {
        ...data,
        rejected_at: data.rejected_at || undefined,
        rejected_by: data.rejected_by || undefined,
      } as Strategy;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for strategy versions
  const versionsQuery = useQuery({
    queryKey: ['strategy-versions', strategyId],
    queryFn: async (): Promise<StrategyVersion[]> => {
      const { data, error } = await supabase
        .from('strategy_versions')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw new Error(`Error fetching strategy versions: ${error.message}`);
      }
      
      return data || [];
    },
    enabled: !!strategyQuery.data,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for strategy executions
  const executionsQuery = useQuery({
    queryKey: ['strategy-executions', strategyId],
    queryFn: async (): Promise<StrategyExecution[]> => {
      const { data, error } = await supabase
        .from('strategy_executions')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) {
        throw new Error(`Error fetching strategy executions: ${error.message}`);
      }
      
      return data || [];
    },
    enabled: !!strategyQuery.data,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle error notifications only once when they occur
  if (strategyQuery.isError) {
    console.error('Strategy query error:', strategyQuery.error);
    notify({ 
      title: 'Error loading strategy', 
      description: strategyQuery.error instanceof Error ? strategyQuery.error.message : 'Unknown error'
    });
  }

  const refetchAll = async () => {
    try {
      await Promise.all([
        strategyQuery.refetch(),
        versionsQuery.refetch(),
        executionsQuery.refetch()
      ]);
      
      notify({ title: 'Data refreshed' });
    } catch (error) {
      console.error('Error refetching data:', error);
      notify({ 
        title: 'Error refreshing data',
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return {
    strategy: strategyQuery,
    versions: versionsQuery,
    executions: executionsQuery,
    refetch: refetchAll,
    isLoading: strategyQuery.isLoading || versionsQuery.isLoading || executionsQuery.isLoading,
    isError: strategyQuery.isError || versionsQuery.isError || executionsQuery.isError
  };
};

export default useStrategyData;
