
import { useState, useEffect, useCallback } from 'react';
import type { SystemLog, LogFilters } from '@/types/logs';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Mock data for example purposes
const generateMockLogs = (count: number): SystemLog[] => {
  const modules = ['system', 'auth', 'api', 'database', 'strategy'];
  const levels = ['info', 'warning', 'error'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const tenants = ['tenant1', 'tenant2', 'tenant3', 'system'];
  const errorTypes = ['RuntimeError', 'ValidationError', 'NetworkError', 'AuthError', 'DatabaseError'];
  
  return Array.from({ length: count }).map((_, i) => {
    const now = new Date();
    const randomDate = new Date(
      now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000
    );
    
    const module = modules[Math.floor(Math.random() * modules.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const tenant = tenants[Math.floor(Math.random() * tenants.length)];
    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    return {
      id: `log-${i}`,
      created_at: randomDate.toISOString(),
      description: `Example ${level} log message for ${module}`,
      level: level as any,
      module,
      tenant_id: tenant,
      user_id: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 10)}` : undefined,
      metadata: {
        source: 'mock',
        severity,
        user_facing: Math.random() > 0.7,
        affects_multiple_users: Math.random() > 0.8,
        error_type: errorType
      },
      request_id: `req-${Math.random().toString(36).substring(2, 10)}`,
      error_type: errorType,
      severity: severity,
      error: `${errorType}: Something went wrong in ${module}`,
      event: level === 'error' ? 'error' : level === 'warning' ? 'warning' : 'info',
      user_facing: Math.random() > 0.7,
      affects_multiple_users: Math.random() > 0.8
    };
  });
};

/**
 * Hook to fetch and filter system logs data
 */
export function useSystemLogsData(initialFilters: Partial<LogFilters> = {}) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [filters, setFilters] = useState<LogFilters>({
    ...initialFilters
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be a supabase query
      // For now, generate mock data
      const mockLogs = generateMockLogs(50);
      
      // Log this action
      await logSystemEvent(
        'system',
        'info',
        {
          description: 'Fetched system logs',
          log_count: mockLogs.length
        }
      );
      
      setLogs(mockLogs);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply filters to logs
  const applyFilters = useCallback(() => {
    let result = [...logs];
    
    // Filter by level
    if (filters.level && filters.level.length > 0) {
      result = result.filter(log => filters.level?.includes(log.level));
    }
    
    // Filter by module
    if (filters.module && filters.module.length > 0) {
      result = result.filter(log => filters.module?.includes(log.module));
    }
    
    // Filter by tenant
    if (filters.tenant_id) {
      result = result.filter(log => log.tenant_id === filters.tenant_id);
    }
    
    // Filter by date range
    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      result = result.filter(log => new Date(log.created_at) >= fromDate);
    }
    
    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      result = result.filter(log => new Date(log.created_at) <= toDate);
    }
    
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(log => 
        log.description.toLowerCase().includes(searchLower) || 
        log.module.toLowerCase().includes(searchLower) ||
        (log.error && log.error.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by error type
    if (filters.error_type && filters.error_type.length > 0) {
      result = result.filter(log => 
        log.error_type && filters.error_type?.includes(log.error_type)
      );
    }
    
    // Filter by severity
    if (filters.severity && filters.severity.length > 0) {
      result = result.filter(log => 
        log.severity && filters.severity?.includes(log.severity)
      );
    }
    
    setFilteredLogs(result);
  }, [logs, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Fetch logs on mount
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Apply filters whenever logs or filters change
  useEffect(() => {
    applyFilters();
  }, [logs, filters, applyFilters]);

  return {
    logs: filteredLogs,
    allLogs: logs,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch: fetchLogs
  };
}

export default useSystemLogsData;
