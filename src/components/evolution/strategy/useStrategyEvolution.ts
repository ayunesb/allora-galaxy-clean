
import { useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Strategy } from '@/types/strategy';
import { format } from 'date-fns';
import { Log } from '@/types/logs';

export const useStrategyEvolution = (strategyId: string) => {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Strategy query
  const strategyQuery = useQuery({
    queryKey: ['strategy-evolution', strategyId],
    queryFn: async () => {
      if (!strategyId || strategyId === 'default') {
        return null;
      }
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', strategyId)
        .maybeSingle();
        
      if (error) throw error;
      
      // If no data is found, return mock data for development
      if (!data) {
        return {
          id: strategyId,
          name: `Strategy ${strategyId}`,
          status: 'pending' as const,
          tenant_id: 'tenant-1',
          title: `Strategy ${strategyId}`,
          description: 'A mock strategy for development',
          created_by: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          approved_by: undefined,
          approved_at: undefined,
          priority: 'medium',
          completion_percentage: 0,
        } as Strategy;
      }
      
      return data as Strategy;
    },
    enabled: !!strategyId,
  });

  // Logs query
  const logsQuery = useQuery({
    queryKey: ['strategy-logs', strategyId],
    queryFn: async () => {
      if (!strategyId || strategyId === 'default') {
        return [];
      }
      
      const { data, error } = await supabase
        .from('execution_logs')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('timestamp', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      // If no data is found, return mock data for development
      if (!data || data.length === 0) {
        return Array(5).fill(null).map((_, i) => ({
          id: `log-${i}`,
          timestamp: new Date().toISOString(),
          message: `Log entry ${i}`,
          status: i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'success',
          event_type: i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'info'
        }));
      }
      
      return data;
    },
    enabled: !!strategyId,
  });

  // History query
  const historyQuery = useQuery({
    queryKey: ['strategy-history', strategyId],
    queryFn: async () => {
      if (!strategyId || strategyId === 'default') {
        return [];
      }
      
      const { data, error } = await supabase
        .from('strategy_versions')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // If no data is found, return mock data for development
      if (!data || data.length === 0) {
        return Array(3).fill(null).map((_, i) => ({
          id: `history-${i}`,
          version: i + 1,
          created_at: new Date().toISOString(),
          changes: `Version ${i + 1} changes`
        }));
      }
      
      return data;
    },
    enabled: !!strategyId,
  });

  // Users query 
  const usersQuery = useQuery({
    queryKey: ['strategy-users', strategyId],
    queryFn: async () => {
      if (!strategyId || !strategyQuery.data?.created_by) {
        return {
          owner: { id: 'user1', name: 'John Doe' },
          contributors: [
            { id: 'user2', name: 'Jane Smith' },
            { id: 'user3', name: 'Mike Johnson' }
          ]
        };
      }
      
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', strategyQuery.data.created_by)
        .maybeSingle();
        
      if (ownerError) throw ownerError;
      
      // Get contributors from strategy versions
      const { data: contributors, error: contribError } = await supabase
        .from('strategy_versions')
        .select('created_by')
        .eq('strategy_id', strategyId)
        .neq('created_by', strategyQuery.data.created_by)
        .distinct();
        
      if (contribError) throw contribError;
      
      // Fetch contributor profiles
      let contributorProfiles = [];
      if (contributors && contributors.length > 0) {
        const contributorIds = contributors.map(c => c.created_by);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', contributorIds);
          
        contributorProfiles = profiles || [];
      }
      
      return {
        owner: ownerData || { id: 'user1', name: 'John Doe' },
        contributors: contributorProfiles.length > 0 
          ? contributorProfiles 
          : [
              { id: 'user2', name: 'Jane Smith' },
              { id: 'user3', name: 'Mike Johnson' }
            ]
      };
    },
    enabled: !!strategyId && !!strategyQuery.data?.created_by,
  });

  const handleLogClick = (logId: string) => {
    setSelectedLogId(logId);
    setIsLogModalOpen(true);
  };

  const handleCloseLogModal = () => {
    setIsLogModalOpen(false);
  };

  const selectedLog = logsQuery.data?.find((log: Log) => log.id === selectedLogId) || null;
  
  // Create a userMap for lookup
  const userMap: Record<string, any> = {};
  if (usersQuery.data?.owner) {
    userMap[usersQuery.data.owner.id] = usersQuery.data.owner;
  }
  if (usersQuery.data?.contributors) {
    usersQuery.data.contributors.forEach((user: any) => {
      userMap[user.id] = user;
    });
  }
  
  // Format date helper function
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  // Combine all loading states
  const isLoading = strategyQuery.isLoading || logsQuery.isLoading || 
    historyQuery.isLoading || usersQuery.isLoading;
  
  // Combine errors from all queries
  const failedQueries = [
    strategyQuery.error && 'strategy',
    logsQuery.error && 'logs',
    historyQuery.error && 'history',
    usersQuery.error && 'users',
  ].filter(Boolean);
  
  const error = failedQueries.length > 0 
    ? new Error(`Failed to load: ${failedQueries.join(', ')}`) 
    : undefined;

  const refetch = () => {
    strategyQuery.refetch();
    logsQuery.refetch();
    historyQuery.refetch();
    usersQuery.refetch();
  };

  return {
    strategy: strategyQuery.data,
    logs: logsQuery.data || [],
    history: historyQuery.data || [],
    users: usersQuery.data,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    isPartialLoading: !isLoading && (strategyQuery.isFetching || logsQuery.isFetching || 
      historyQuery.isFetching || usersQuery.isFetching),
    failedQueries,
    retryQueries: refetch,
    refetch,
    selectedLog,
    isLogModalOpen,
    handleLogClick,
    handleCloseLogModal,
    userMap, // Added for StrategyEvolutionTab
    formatDate, // Added for StrategyEvolutionTab
    error // Added for error handling
  };
};
