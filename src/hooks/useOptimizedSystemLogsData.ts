import { useState, useCallback, useMemo } from "react";
import type {
  SystemLog,
  LogFilters,
  LogLevel,
  LogSeverity,
} from "@/types/logs";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { useQuery } from "@tanstack/react-query";

/**
 * Mock data function moved to a separate function to memoize it
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
 * Optimized hook to fetch and filter system logs data using React Query
 */
export function useOptimizedSystemLogsData(
  initialFilters: Partial<LogFilters> = {},
) {
  const [filters, setFilters] = useState<LogFilters>({
    ...initialFilters,
  });

  // Fetch logs using React Query for caching and automatic refetching
  const {
    data: logs = [],
    isLoading,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: ["system-logs"],
    queryFn: async () => {
      try {
        // In a real app, this would be a supabase query
        // For now, generate mock data
        const mockLogs = generateMockLogs(50);

        // Log this action
        await logSystemEvent("system", "info", {
          description: "Fetched system logs",
          log_count: mockLogs.length,
        });

        return mockLogs;
      } catch (err) {
        console.error("Failed to fetch logs:", err);
        throw err instanceof Error ? err : new Error(String(err));
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Memoize the filter application logic
  const applyFilters = useCallback(
    (data: SystemLog[], currentFilters: LogFilters) => {
      let result = [...data];

      // Filter by level - handle both string and string[] cases
      if (currentFilters.level) {
        const levelFilters = Array.isArray(currentFilters.level)
          ? currentFilters.level
          : [currentFilters.level];

        if (levelFilters.length > 0) {
          result = result.filter((log) => levelFilters.includes(log.level));
        }
      }

      // Filter by module - handle both string and string[] cases
      if (currentFilters.module) {
        const moduleFilters = Array.isArray(currentFilters.module)
          ? currentFilters.module
          : [currentFilters.module];

        if (moduleFilters.length > 0) {
          result = result.filter((log) => moduleFilters.includes(log.module));
        }
      }

      // Filter by tenant
      if (currentFilters.tenant_id) {
        result = result.filter(
          (log) => log.tenant_id === currentFilters.tenant_id,
        );
      }

      // Filter by date range - handle all date field aliases
      const fromDate =
        currentFilters.fromDate ||
        currentFilters.startDate ||
        currentFilters.dateFrom;
      if (fromDate) {
        const dateFrom = new Date(fromDate);
        result = result.filter((log) => new Date(log.created_at) >= dateFrom);
      }

      const toDate =
        currentFilters.toDate ||
        currentFilters.endDate ||
        currentFilters.dateTo;
      if (toDate) {
        const dateTo = new Date(toDate);
        result = result.filter((log) => new Date(log.created_at) <= dateTo);
      }

      // Filter by search term - handle both search and searchTerm aliases
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

      // Filter by error type
      if (currentFilters.error_type) {
        const errorTypeFilters = Array.isArray(currentFilters.error_type)
          ? currentFilters.error_type
          : [currentFilters.error_type];

        result = result.filter(
          (log) => log.error_type && errorTypeFilters.includes(log.error_type),
        );
      }

      // Filter by severity
      if (currentFilters.severity) {
        const severityFilters = Array.isArray(currentFilters.severity)
          ? currentFilters.severity
          : [currentFilters.severity];

        result = result.filter(
          (log) => log.severity && severityFilters.includes(log.severity),
        );
      }

      return result;
    },
    [],
  );

  // Memoized filtered logs
  const filteredLogs = useMemo(() => {
    if (!logs.length) return [];
    return applyFilters(logs, filters);
  }, [logs, filters, applyFilters]);

  // Memoized error stats calculation
  const errorStats = useMemo(() => {
    const errorLogs = logs.filter((log) => log.level === "error");
    return {
      totalErrors: errorLogs.length,
      criticalErrors: errorLogs.filter((log) => log.severity === "critical")
        .length,
      highErrors: errorLogs.filter((log) => log.severity === "high").length,
      mediumErrors: errorLogs.filter((log) => log.severity === "medium").length,
      lowErrors: errorLogs.filter((log) => log.severity === "low").length,
      userFacingErrors: errorLogs.filter((log) => log.user_facing === true)
        .length,
      affectedUsers: new Set(
        errorLogs.map((log) => log.user_id).filter(Boolean),
      ).size,
    };
  }, [logs]);

  // Update filters - normalize filter values for consistency
  const updateFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFilters((prev) => {
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
        ...newFilters,
      };
    });
  }, []);

  // Memoized error logs
  const errorLogs = useMemo(
    () => logs.filter((log) => log.level === "error"),
    [logs],
  );

  return {
    logs: filteredLogs,
    allLogs: logs,
    isLoading,
    error: fetchError,
    filters,
    updateFilters,
    refetch,
    errorLogs,
    errorStats,
  };
}

export default useOptimizedSystemLogsData;
