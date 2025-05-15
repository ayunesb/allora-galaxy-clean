
import { useState, useEffect, useCallback } from 'react';
import type { SystemLog, LogFilters, LogLevel, LogSeverity } from '@/types/logs';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Type guard for LogLevel
 */
const isLogLevel = (value: string): value is LogLevel => {
  return ['info', 'warning', 'error'].includes(value);
};

/**
 * Type guard for LogSeverity
 */
const isLogSeverity = (value: string): value is LogSeverity => {
  return ['low', 'medium', 'high', 'critical'].includes(value);
};

// Mock data for example purposes
const generateMockLogs = (count: number): SystemLog[] => {
  const modules = ['system', 'auth', 'api', 'database', 'strategy'];
  const levels: LogLevel[] = ['info', 'warning', 'error'];
  const severities: LogSeverity[] = ['low', 'medium', 'high', 'critical'];
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
    
    const record: SystemLog = {
      id: `log-${i}`,
      created_at: randomDate.toISOString(),
      timestamp: randomDate.toISOString(),
      description: `Example ${level} log message for ${module}`,
      message: `Example ${level} log message for ${module}`,
      level,
      module,
      tenant_id: tenant,
      user_id: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 10)}` : undefined,
      metadata: {
        source: 'mock',
        severity,
        user_facing: Math.random() > 0.7,
        affects_multiple_users: Math.random() > 0.8,
      },
      request_id: `req-${Math.random().toString(36).substring(2, 10)}`,
      error_type: level === 'error' ? errorType : undefined,
      severity,
      priority: severity,
      error_message: level === 'error' ? `${errorType}: Something went wrong in ${module}` : undefined,
      event: level === 'error' ? 'error' : level === 'warning' ? 'warning' : 'info',
      event_type: level === 'error' ? 'error' : level === 'warning' ? 'warning' : 'info',
      context: {},
      user_facing: Math.random() > 0.7,
      affects_multiple_users: Math.random() > 0.8
    };
    
    return record;
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
    
    // Filter by level - handle both string and string[] cases
    if (filters.level) {
      const levelFilters = Array.isArray(filters.level) 
        ? filters.level 
        : [filters.level];
      
      if (levelFilters.length > 0) {
        result = result.filter(log => levelFilters.includes(log.level));
      }
    }
    
    // Filter by module - handle both string and string[] cases
    if (filters.module) {
      const moduleFilters = Array.isArray(filters.module) 
        ? filters.module 
        : [filters.module];
      
      if (moduleFilters.length > 0) {
        result = result.filter(log => moduleFilters.includes(log.module));
      }
    }
    
    // Filter by tenant
    if (filters.tenant_id) {
      result = result.filter(log => log.tenant_id === filters.tenant_id);
    }
    
    // Filter by date range - handle all date field aliases
    const fromDate = filters.fromDate || filters.startDate || filters.dateFrom;
    if (fromDate) {
      const dateFrom = new Date(fromDate);
      result = result.filter(log => new Date(log.created_at) >= dateFrom);
    }
    
    const toDate = filters.toDate || filters.endDate || filters.dateTo;
    if (toDate) {
      const dateTo = new Date(toDate);
      result = result.filter(log => new Date(log.created_at) <= dateTo);
    }
    
    // Filter by search term - handle both search and searchTerm aliases
    const searchQuery = filters.search || filters.searchTerm;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(log => 
        (log.description && log.description.toLowerCase().includes(searchLower)) || 
        log.module.toLowerCase().includes(searchLower) ||
        (log.error_message && log.error_message.toLowerCase().includes(searchLower)) ||
        (log.message && log.message.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by error type
    if (filters.error_type) {
      const errorTypeFilters = Array.isArray(filters.error_type) 
        ? filters.error_type 
        : [filters.error_type];
        
      result = result.filter(log => 
        log.error_type && errorTypeFilters.includes(log.error_type)
      );
    }
    
    // Filter by severity
    if (filters.severity) {
      const severityFilters = Array.isArray(filters.severity) 
        ? filters.severity 
        : [filters.severity];
        
      result = result.filter(log => 
        log.severity && severityFilters.includes(log.severity)
      );
    }
    
    setFilteredLogs(result);
  }, [logs, filters]);

  // Update filters - normalize filter values for consistency
  const updateFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFilters(prev => {
      // Handle search/searchTerm consistency
      if (newFilters.search && !newFilters.searchTerm) {
        newFilters.searchTerm = newFilters.search;
      } else if (newFilters.searchTerm && !newFilters.search) {
        newFilters.search = newFilters.searchTerm;
      }
      
      // Handle date field naming consistency
      if (newFilters.fromDate && !newFilters.startDate) {
        newFilters.startDate = newFilters.fromDate;
      } else if (newFilters.startDate && !newFilters.fromDate) {
        newFilters.fromDate = newFilters.startDate;
      }
      
      if (newFilters.toDate && !newFilters.endDate) {
        newFilters.endDate = newFilters.toDate;
      } else if (newFilters.endDate && !newFilters.toDate) {
        newFilters.toDate = newFilters.endDate;
      }
      
      return {
        ...prev,
        ...newFilters
      };
    });
  }, []);

  // Fetch logs on mount
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Apply filters whenever logs or filters change
  useEffect(() => {
    applyFilters();
  }, [logs, filters, applyFilters]);

  // Calculate error stats
  const errorLogs = logs.filter(log => log.level === 'error');
  const errorStats = {
    totalErrors: errorLogs.length,
    criticalErrors: errorLogs.filter(log => log.severity === 'critical').length,
    highErrors: errorLogs.filter(log => log.severity === 'high').length,
    mediumErrors: errorLogs.filter(log => log.severity === 'medium').length,
    lowErrors: errorLogs.filter(log => log.severity === 'low').length,
    userFacingErrors: errorLogs.filter(log => log.user_facing === true).length,
    affectedUsers: new Set(errorLogs.map(log => log.user_id).filter(Boolean)).size,
  };

  return {
    logs: filteredLogs,
    allLogs: logs,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch: fetchLogs,
    errorLogs,
    errorStats
  };
}

export default useSystemLogsData;
