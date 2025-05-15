
import type { LogSeverity, SystemLog } from '@/types/logs';

/**
 * Get color class for severity level
 */
export const getSeverityColor = (severity: LogSeverity | undefined): string => {
  switch (severity) {
    case 'critical':
      return 'text-red-500 bg-red-100 dark:bg-red-900/20';
    case 'high':
      return 'text-amber-500 bg-amber-100 dark:bg-amber-900/20';
    case 'medium':
      return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
    case 'low':
      return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
    default:
      return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
  }
};

/**
 * Get human-readable label for severity level
 */
export const getSeverityLabel = (severity: LogSeverity | undefined): string => {
  switch (severity) {
    case 'critical':
      return 'Critical';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return 'Unknown';
  }
};

/**
 * Count logs by severity
 */
export const countLogsBySeverity = (logs: SystemLog[]): Record<LogSeverity | string, number> => {
  const counts: Record<string, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
  };
  
  logs.forEach(log => {
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
 * Calculate percentages for each severity level
 */
export const calculateSeverityPercentages = (logs: SystemLog[]): Record<LogSeverity | string, number> => {
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
export const getSeverityWeight = (severity: LogSeverity | undefined): number => {
  switch (severity) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
};

/**
 * Sort logs by severity (highest first)
 */
export const sortBySeverity = (logs: SystemLog[]): SystemLog[] => {
  return [...logs].sort((a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity));
};
