import { useState, useEffect, useCallback } from "react";
import type {
  SystemLog,
  LogFilters,
  LogLevel,
  LogSeverity,
} from "@/types/logs";
import { logSystemEvent } from "@/lib/system/logSystemEvent";

/**
 * Mock data for example purposes
 */
const generateMockLogs = (count: number): SystemLog[] => {
  const modules = ["system", "auth", "api", "database", "strategy"];
  const levels: LogLevel[] = ["info", "warning", "error"];
  const severities: LogSeverity[] = ["low", "medium", "high", "critical"];
  const tenants = ["tenant1", "tenant2", "tenant3", "system"];
  const errorTypes = [
    "RuntimeError",
    "ValidationError",
    "NetworkError",
    "AuthError",
    "DatabaseError",
  ];

  return Array.from({ length: count }).map((_, i) => {
    const now = new Date();
    const randomDate = new Date(
      now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
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
      user_id:
        Math.random() > 0.5
          ? `user-${Math.floor(Math.random() * 10)}`
          : undefined,
      metadata: {
        source: "mock",
        severity,
        user_facing: Math.random() > 0.7,
        affects_multiple_users: Math.random() > 0.8,
      },
      request_id: `req-${Math.random().toString(36).substring(2, 10)}`,
      error_type: level === "error" ? errorType : undefined,
      severity,
      priority: severity,
      error_message:
        level === "error"
          ? `${errorType}: Something went wrong in ${module}`
          : undefined,
      event:
        level === "error" ? "error" : level === "warning" ? "warning" : "info",
      event_type:
        level === "error" ? "error" : level === "warning" ? "warning" : "info",
      context: {},
      user_facing: Math.random() > 0.7,
      affects_multiple_users: Math.random() > 0.8,
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
    ...initialFilters,
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
      await logSystemEvent("system", "info", {
        description: "Fetched system logs",
        log_count: mockLogs.length,
      });

      setLogs(mockLogs);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
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
        result = result.filter((log) => levelFilters.includes(log.level));
      }
    }

    // Filter by module - handle both string and string[] cases
    if (filters.module) {
      const moduleFilters = Array.isArray(filters.module)
        ? filters.module
        : [filters.module];

      if (moduleFilters.length > 0) {
        result = result.filter((log) => moduleFilters.includes(log.module));
      }
    }

    // Filter by tenant
    if (filters.tenant_id) {
      result = result.filter((log) => log.tenant_id === filters.tenant_id);
    }

    // Filter by date range - handle all date field aliases
    // Only use fields defined in LogFilters
    const toDate = filters.dateRange?.to;
    if (toDate) {
      const dateTo = new Date(toDate);
      result = result.filter((log) => new Date(log.created_at) <= dateTo);
    }

    // Filter by search term
    const searchLower = (filters.search?.toLowerCase() ?? "") || (filters.searchTerm?.toLowerCase() ?? "");
    if (searchLower) {
      result = result.filter(
        (log) =>
          (log.description?.toLowerCase().includes(searchLower)) ||
          (log.module?.toLowerCase().includes(searchLower)) ||
          (log.error_message?.toLowerCase().includes(searchLower)) ||
          (log.message?.toLowerCase().includes(searchLower)),
      );
    }

    // Filter by severity
    if (filters.severity) {
      const severityFilters = Array.isArray(filters.severity)
        ? filters.severity
        : [filters.severity];

      result = result.filter(
        (log) => log.severity && severityFilters.includes(log.severity),
      );
    }

    setFilteredLogs(result);
  }, [logs, filters]);

  // Update filters - normalize filter values for consistency
  const updateFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
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

  // Calculate error stats
  const errorLogs = logs.filter((log) => log.level === "error");
  const errorStats = {
    totalErrors: errorLogs.length,
    criticalErrors: errorLogs.filter((log) => log.severity === "critical")
      .length,
    highErrors: errorLogs.filter((log) => log.severity === "high").length,
    mediumErrors: errorLogs.filter((log) => log.severity === "medium").length,
    lowErrors: errorLogs.filter((log) => log.severity === "low").length,
    userFacingErrors: errorLogs.filter((log: ExtendedSystemLog) => log.user_facing === true).length,
    affectedUsers: new Set(
      errorLogs
        .map((log: ExtendedSystemLog) => log.user_id)
        .filter((id): id is string => typeof id === "string")
    ).size,
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
    errorStats,
  };
}

// Extend SystemLog locally for user_facing and user_id if needed
interface ExtendedSystemLog extends SystemLog {
  user_facing?: boolean;
  user_id?: string;
}

export default useSystemLogsData;
