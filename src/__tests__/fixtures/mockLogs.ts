
import { SystemLog, LogLevel, LogSeverity } from '@/types/logs';

/**
 * Generate a mock system log entry
 */
export function createMockLog(overrides: Partial<SystemLog> = {}): SystemLog {
  const now = new Date();
  const id = `log_${Math.random().toString(36).substring(2, 9)}`;
  
  return {
    id,
    created_at: now.toISOString(),
    timestamp: now.toISOString(),
    module: 'system',
    level: 'info',
    event: 'test_event',
    description: 'Test log entry',
    tenant_id: 'tenant_1',
    // Optional fields with defaults
    message: overrides.message || 'Test log entry',
    event_type: overrides.event_type || 'test',
    user_id: overrides.user_id || undefined,
    context: overrides.context || {},
    metadata: overrides.metadata || {},
    request_id: overrides.request_id || `req_${id.substring(4)}`,
    error_type: overrides.error_type || undefined,
    severity: overrides.severity || undefined,
    priority: overrides.priority || undefined,
    error_message: overrides.error_message || undefined,
    user_facing: overrides.user_facing || false,
    affects_multiple_users: overrides.affects_multiple_users || false,
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
    
    const level = levels[i % levels.length];
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
