import { useEffect, useCallback } from 'react';
import { useSupabaseFetch, usePartialDataFetch } from '@/hooks/supabase';
import { Strategy } from '@/types/strategy';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

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
  // Format date helper
  const formatDate = useCallback((dateStr: string): string => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy HH:mm:ss');
    } catch (error) {
      return dateStr;
    }
  }, []);

  // Use partial data fetch for all strategy-related data
  const {
    data,
    isLoading: loading,
    error,
    isPartialData,
  } = usePartialDataFetch<{
    strategy: Strategy | null;
    logs: any[];
    history: any[];
    users: Record<string, any>;
  }>(
    {
      strategy: async () => {
        if (!strategyId || strategyId === 'default') {
          return null;
        }
        
        const { data, error } = await supabase
          .from('strategies')
          .select('*')
          .eq('id', strategyId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          const typedStrategy: Strategy = {
            id: data.id,
            tenant_id: data.tenant_id || '',
            title: data.title || '',
            description: data.description || '',
            status: (data.status as Strategy['status']) || 'draft',
            created_by: data.created_by || '',
            created_at: data.created_at || '',
            approved_by: data.approved_by || null,
            approved_at: data.approved_at || null,
            rejected_by: data.rejected_by || null,
            rejected_at: data.rejected_at || null,
            priority: data.priority as Strategy['priority'] || null,
            tags: data.tags || null,
            completion_percentage: data.completion_percentage || null,
            due_date: data.due_date || null,
            updated_at: data.updated_at || null,
            metadata: data.metadata || null
          };
          
          return typedStrategy;
        }
        
        return null;
      },
      
      logs: async () => {
        if (!strategyId || strategyId === 'default') {
          return [];
        }
        
        const { data, error } = await supabase
          .from('executions')
          .select('*')
          .eq('strategy_id', strategyId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        return data || [];
      },
      
      history: async () => {
        if (!strategyId || strategyId === 'default') {
          return [];
        }
        
        const { data, error } = await supabase
          .from('system_logs')
          .select('*')
          .eq('module', 'strategy')
          .contains('context', { strategy_id: strategyId })
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        return data || [];
      },
      
      users: async () => {
        if (!strategyId || strategyId === 'default') {
          return {};
        }
        
        // Collect user IDs first from strategy and logs
        const { data: strategyData } = await supabase
          .from('strategies')
          .select('created_by, approved_by, rejected_by')
          .eq('id', strategyId)
          .maybeSingle();
          
        const { data: executionLogs } = await supabase
          .from('executions')
          .select('executed_by')
          .eq('strategy_id', strategyId);
          
        // Build set of unique user IDs
        const userIds = new Set<string>();
        
        if (strategyData?.created_by) userIds.add(strategyData.created_by);
        if (strategyData?.approved_by) userIds.add(strategyData.approved_by);
        if (strategyData?.rejected_by) userIds.add(strategyData.rejected_by);
        
        executionLogs?.forEach(log => {
          if (log.executed_by) userIds.add(log.executed_by);
        });
        
        if (userIds.size === 0) {
          return {};
        }
        
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
        
        return usersMap;
      },
    },
    {
      enabled: strategyId !== '' && strategyId !== 'default',
      showErrorToast: true,
    }
  );
  
  // Ensure we have sane defaults when data is undefined
  const strategy = data?.strategy || null;
  const logs = data?.logs || [];
  const history = data?.history || [];
  const userMap = data?.users || {};

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
