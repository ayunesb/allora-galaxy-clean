import type { LogSeverity, SystemLog } from "@/types/logs";

/**
 * Get color class for severity level
 */
export const getSeverityColor = (severity: LogSeverity | undefined): string => {
  switch (severity) {
    case "critical":
      return "#ef4444"; // red-500
    case "high":
      return "#f97316"; // orange-500
    case "medium":
      return "#eab308"; // yellow-500
    case "low":
      return "#22c55e"; // green-500
    default:
      return "#6b7280"; // gray-500
  }
};

/**
 * Get text color class for severity level
 */
export const getSeverityTextColor = (
  severity: LogSeverity | undefined,
): string => {
  switch (severity) {
    case "critical":
      return "text-red-500";
    case "high":
      return "text-orange-500";
    case "medium":
      return "text-yellow-500";
    case "low":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};

/**
 * Get badge variant name for severity level
 */
export const getSeverityBadgeVariant = (
  severity: LogSeverity | undefined,
): string => {
  switch (severity) {
    case "critical":
      return "destructive";
    case "high":
      return "orange";
    case "medium":
      return "yellow";
    case "low":
      return "blue";
    default:
      return "secondary";
  }
};

/**
 * Count logs by severity
 */
export const countLogsBySeverity = (
  logs: SystemLog[],
): Record<LogSeverity | string, number> => {
  const counts: Record<string, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
  };

  logs.forEach((log) => {
    if (log.severity && counts[log.severity] !== undefined) {
      counts[log.severity]++;
    } else {
      counts.unknown++;
    }
  });

  return counts;
};

/**
 * Alias for countLogsBySeverity for backward compatibility
 */
export const countBySeverity = countLogsBySeverity;

/**
 * Calculate overall severity from a set of logs
 * Returns the highest severity level found in the logs
 */
export const calculateOverallSeverity = (logs: SystemLog[]): LogSeverity => {
  if (logs.length === 0) return "low";

  if (logs.some((log) => log.severity === "critical")) {
    return "critical";
  }

  if (logs.some((log) => log.severity === "high")) {
    return "high";
  }

  if (logs.some((log) => log.severity === "medium")) {
    return "medium";
  }

  return "low";
};

/**
 * Calculate percentages for each severity level
 */
export const calculateSeverityPercentages = (
  logs: SystemLog[],
): Record<LogSeverity | string, number> => {
  const counts = countLogsBySeverity(logs);
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  if (total === 0) return counts;

  const percentages: Record<string, number> = {};

  Object.entries(counts).forEach(([severity, count]) => {
    percentages[severity] = Math.round((count / total) * 100);
  });

  return percentages;
};

/**
 * Get severity weight for sorting
 */
export const getSeverityWeight = (
  severity: LogSeverity | undefined,
): number => {
  switch (severity) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
};

/**
 * Sort logs by severity (highest first)
 */
export const sortBySeverity = (logs: SystemLog[]): SystemLog[] => {
  return [...logs].sort(
    (a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity),
  );
};
