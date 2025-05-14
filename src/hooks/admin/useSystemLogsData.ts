
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSystemLogs, SystemLogFilter } from '@/lib/admin/systemLogs';
import { LogFilters } from '@/types/logs';
import { addDays } from 'date-fns';

/**
 * Hook for managing system logs data with filtering and error handling
 */
export const useSystemLogsData = (initialFilters: LogFilters = {}) => {
  const [filters, setFilters] = useState<LogFilters>(initialFilters);
  
  // Add default date range if not provided
  const dateRange = {
    from: new Date(initialFilters.fromDate || addDays(new Date(), -30).toISOString()),
    to: initialFilters.toDate ? new Date(initialFilters.toDate) : new Date(),
  };

  // Convert LogFilters to SystemLogFilter
  const getSystemLogFilter = useCallback((): SystemLogFilter => {
    return {
      searchTerm: filters.search,
      module: filters.module?.[0],
      tenant: filters.tenant_id,
      dateRange: {
        from: filters.fromDate ? new Date(filters.fromDate) : undefined, 
        to: filters.toDate ? new Date(filters.toDate) : undefined
      }
    };
  }, [filters]);

  // Fetch logs with current filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['system-logs', filters],
    queryFn: async () => {
      try {
        return await fetchSystemLogs(getSystemLogFilter());
      } catch (err) {
        console.error('Error fetching system logs:', err);
        throw err;
      }
    }
  });

  // Update filters
  const updateFilters = useCallback((newFilters: LogFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Filter logs by error type (used for error monitoring)
  const errorLogs = (data || []).filter(log => 
    log.level === 'error' || 
    log.event === 'error' || 
    log.event?.includes('error') || 
    log.event?.includes('exception')
  );

  // Calculate error statistics
  const errorStats = {
    totalErrors: errorLogs.length,
    criticalErrors: errorLogs.filter(log => log.severity === 'critical').length,
    highErrors: errorLogs.filter(log => log.severity === 'high').length,
    mediumErrors: errorLogs.filter(log => log.severity === 'medium').length,
    lowErrors: errorLogs.filter(log => log.severity === 'low').length,
  };

  return {
    logs: data || [],
    errorLogs,
    errorStats,
    isLoading,
    error,
    filters,
    updateFilters,
    dateRange,
    refetch
  };
};

export default useSystemLogsData;
