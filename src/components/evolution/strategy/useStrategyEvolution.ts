
import { useState } from 'react';
import { usePartialDataFetch } from '@/hooks/supabase';
import { Strategy } from '@/types/strategy';

export const useStrategyEvolution = (strategyId: string) => {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const {
    results: data,
    isLoading,
    isPartialLoading,
    refetch,
    failedQueries,
    retryQueries
  } = usePartialDataFetch({
    queries: {
      strategy: {
        query: async () => {
          // Mock fetching a strategy
          return {
            id: strategyId,
            name: `Strategy ${strategyId}`,
            status: 'active'
          } as Strategy;
        }
      },
      logs: {
        query: async () => {
          // Mock fetching strategy logs
          return Array(5).fill(null).map((_, i) => ({
            id: `log-${i}`,
            timestamp: new Date().toISOString(),
            message: `Log entry ${i}`,
            status: i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'success'
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

  return {
    strategy: data?.strategy,
    logs: data?.logs || [],
    history: data?.history || [],
    users: data?.users,
    isLoading: isLoading,
    isPartialLoading,
    failedQueries,
    retryQueries,
    refetch,
    selectedLog,
    isLogModalOpen,
    handleLogClick,
    handleCloseLogModal
  };
};
