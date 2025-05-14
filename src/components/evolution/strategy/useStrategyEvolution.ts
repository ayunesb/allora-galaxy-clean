
import { useState } from 'react';
import { usePartialDataFetch } from '@/hooks/supabase';
import { Strategy } from '@/types/strategy';
import { format } from 'date-fns';

export const useStrategyEvolution = (strategyId: string) => {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const {
    data,
    isLoading,
    failedQueries,
    refetch,
    isPartialData
  } = usePartialDataFetch({
    queries: {
      strategy: {
        query: async () => {
          // Mock fetching a strategy
          return {
            id: strategyId,
            name: `Strategy ${strategyId}`,
            status: 'pending' as const,
            tenant_id: 'tenant-1',
            title: `Strategy ${strategyId}`,
            description: 'A mock strategy for development',
            created_by: 'user-1',
            created_at: new Date().toISOString(),
          } as unknown as Strategy;
        }
      },
      logs: {
        query: async () => {
          // Mock fetching strategy logs
          return Array(5).fill(null).map((_, i) => ({
            id: `log-${i}`,
            timestamp: new Date().toISOString(),
            message: `Log entry ${i}`,
            status: i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'success',
            event_type: i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'info'
          }));
        }
      },
      history: {
        query: async () => {
          // Mock fetching strategy evolution history
          return Array(3).fill(null).map((_, i) => ({
            id: `history-${i}`,
            version: i + 1,
            created_at: new Date().toISOString(),
            changes: `Version ${i + 1} changes`
          }));
        }
      },
      users: {
        query: async () => {
          // Mock fetching users involved with this strategy
          return {
            owner: { id: 'user1', name: 'John Doe' },
            contributors: [
              { id: 'user2', name: 'Jane Smith' },
              { id: 'user3', name: 'Mike Johnson' }
            ]
          };
        }
      },
    },
  });

  const handleLogClick = (logId: string) => {
    setSelectedLogId(logId);
    setIsLogModalOpen(true);
  };

  const handleCloseLogModal = () => {
    setIsLogModalOpen(false);
  };

  const selectedLog = data?.logs?.find(log => log.id === selectedLogId) || null;
  
  // Create a userMap for lookup
  const userMap: Record<string, any> = {};
  if (data?.users?.owner) {
    userMap[data.users.owner.id] = data.users.owner;
  }
  if (data?.users?.contributors) {
    data.users.contributors.forEach((user: any) => {
      userMap[user.id] = user;
    });
  }
  
  // Format date helper function
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };
  
  // Extract error from failed queries
  const error = failedQueries.length > 0 ? new Error(`Failed to load: ${failedQueries.join(', ')}`) : undefined;

  return {
    strategy: data?.strategy,
    logs: data?.logs || [],
    history: data?.history || [],
    users: data?.users,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    isPartialLoading: isPartialData,
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
