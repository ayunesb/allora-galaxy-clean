
import { useCallback, useMemo } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/notifications/toast';
import type { Strategy, StrategyVersion, StrategyExecution } from '@/types/strategy';

interface StrategyDataResult {
  strategy: UseQueryResult<Strategy | null>;
  versions: UseQueryResult<StrategyVersion[]>;
  executions: UseQueryResult<StrategyExecution[]>;
  refetch: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
}

export const useOptimizedStrategyData = (strategyId: string): StrategyDataResult => {
  // Query for the strategy details with proper caching
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
    gcTime: 1000 * 60 * 10,   // 10 minutes
  });

  // Query for strategy versions with dependency on strategy data
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
    gcTime: 1000 * 60 * 10,   // 10 minutes
  });

  // Query for strategy executions with dependency on strategy data
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
    gcTime: 1000 * 60 * 10,   // 10 minutes
  });

  // Optimize error notification to only show once
  const hasShownError = useMemo(() => ({
    strategy: false,
    versions: false,
    executions: false
  }), []);

  if (strategyQuery.isError && !hasShownError.strategy) {
    console.error('Strategy query error:', strategyQuery.error);
    toast.error({ 
      title: 'Error loading strategy', 
      description: strategyQuery.error instanceof Error ? strategyQuery.error.message : 'Unknown error'
    });
    hasShownError.strategy = true;
  }

  // Optimized refetch function
  const refetchAll = useCallback(async () => {
    try {
      await Promise.all([
        strategyQuery.refetch(),
        versionsQuery.refetch(),
        executionsQuery.refetch()
      ]);
      
      toast.success({ title: 'Data refreshed' });
    } catch (error) {
      console.error('Error refetching data:', error);
      toast.error({ 
        title: 'Error refreshing data',
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [strategyQuery, versionsQuery, executionsQuery]);

  return {
    strategy: strategyQuery,
    versions: versionsQuery,
    executions: executionsQuery,
    refetch: refetchAll,
    isLoading: strategyQuery.isLoading || versionsQuery.isLoading || executionsQuery.isLoading,
    isError: strategyQuery.isError || versionsQuery.isError || executionsQuery.isError
  };
};

export default useOptimizedStrategyData;
