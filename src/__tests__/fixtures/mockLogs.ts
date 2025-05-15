
import { SystemLog, LogLevel, LogSeverity } from '@/types/logs';

/**
 * Creates mock SystemLog entries for testing
 * 
 * @param {number} count - Number of log entries to create
 * @returns {SystemLog[]} Array of mock SystemLog entries
 */
export function createMockLog(overrides: Partial<SystemLog> = {}): SystemLog {
  const now = new Date();
  const id = `log_${Math.random().toString(36).substring(2, 9)}`;
  
  return {
    id,
    created_at: now.toISOString(),
    timestamp: now.toISOString(),
    module: 'system',
    level: 'info' as LogLevel,
    event: 'test_event',
    description: 'Test log entry',
    tenant_id: 'tenant_1',
    message: overrides.message || 'Test log entry',
    event_type: overrides.event_type || 'test',
    user_id: overrides.user_id,
    context: overrides.context || '', // Fix: Use string instead of empty object
    error_type: overrides.error_type,
    severity: overrides.severity,
    error_message: overrides.error_message,
    user_facing: overrides.user_facing,
    affects_multiple_users: overrides.affects_multiple_users,
    ...overrides
  };
}

/**
 * Create an array of mock system logs
 */
export function createMockLogs(count = 10, baseDate = new Date()): SystemLog[] {
  const logs: SystemLog[] = [];
  const levels: LogLevel[] = ['info', 'warning', 'error'];
  const modules = ['system', 'auth', 'api', 'database', 'ui'];
  const severities: LogSeverity[] = ['low', 'medium', 'high', 'critical'];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    const level = levels[i % levels.length] as LogLevel;
    const isError = level === 'error';
    
    logs.push(createMockLog({
      id: `log_${i}`,
      created_at: date.toISOString(),
      timestamp: date.toISOString(),
      module: modules[i % modules.length],
      level,
      event: isError ? 'error_occurred' : `test_event_${i}`,
      description: isError ? `Error ${i}` : `Test log entry ${i}`,
      message: isError ? `Error message ${i}` : `Test message ${i}`,
      error_type: isError ? `error_type_${i % 3}` : undefined,
      severity: isError ? severities[i % severities.length] : undefined,
      error_message: isError ? `Detailed error message ${i}` : undefined,
      user_facing: isError && i % 3 === 0,
      affects_multiple_users: isError && i % 5 === 0
    }));
  }
  
  return logs;
}
