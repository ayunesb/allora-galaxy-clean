
import type { SystemLog } from '@/types/logs';

/**
 * Determines if a log is of critical severity
 */
export function isCriticalSeverity(log: SystemLog): boolean {
  return log.severity === 'critical' || (log.level === 'error' && (!log.severity || log.severity === 'critical'));
}

/**
 * Determines if a log is of high severity
 */
export function isHighSeverity(log: SystemLog): boolean {
  return log.severity === 'high' || (log.level === 'error' && (!log.severity || log.severity === 'high'));
}

/**
 * Determines if a log is of medium severity
 */
export function isMediumSeverity(log: SystemLog): boolean {
  return log.severity === 'medium' || (log.level === 'warning' && (!log.severity || log.severity === 'medium'));
}

/**
 * Determines if a log is of low severity
 */
export function isLowSeverity(log: SystemLog): boolean {
  return log.severity === 'low' || (log.level === 'info' && (!log.severity || log.severity === 'low'));
}

/**
 * Count logs by severity
 */
export function countLogsBySeverity(logs: SystemLog[]) {
  return {
    criticalCount: logs.filter(isCriticalSeverity).length,
    highCount: logs.filter(isHighSeverity).length,
    mediumCount: logs.filter(isMediumSeverity).length,
    lowCount: logs.filter(isLowSeverity).length,
  };
}

/**
 * Count errors by type
 */
export function countLogsByErrorType(logs: SystemLog[]): Record<string, number> {
  const errorTypes: Record<string, number> = {};
  
  logs.forEach(log => {
    const errorType = log.error_type || log.level || 'unknown';
    errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
  });
  
  return errorTypes;
}

/**
 * Get top error types (sorted by count)
 */
export function getTopErrorTypes(errorTypes: Record<string, number>, limit = 3): Record<string, number> {
  return Object.entries(errorTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, number>);
}
