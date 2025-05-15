
import { ErrorTrendDataPoint, SystemLog } from '@/types/logs';
import { addDays, format } from 'date-fns';

/**
 * Creates mock SystemLog entries for testing
 * 
 * @param {number} count - Number of log entries to create
 * @returns {SystemLog[]} Array of mock SystemLog entries
 */
export function createMockErrorLogs(count: number = 20): SystemLog[] {
  const logs: SystemLog[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const severity = i % 4 === 0 ? 'critical' : i % 4 === 1 ? 'high' : i % 4 === 2 ? 'medium' : 'low';
    const level = i % 3 === 0 ? 'error' : i % 3 === 1 ? 'warning' : 'info';
    const module = ['system', 'api', 'auth', 'database'][i % 4];
    const timestamp = addDays(now, -Math.floor(i / 3)).toISOString();
    
    logs.push({
      id: `err-${i}`,
      created_at: timestamp,
      timestamp,
      level,
      module,
      description: `Mock ${level} in ${module}`,
      message: `Mock ${level} message #${i}`,
      tenant_id: 'test-tenant',
      severity,
      event: level,
      event_type: level,
      context: {},
      error_type: level === 'error' ? 'TestError' : undefined,
      error_message: level === 'error' ? `Test error #${i}` : undefined,
      user_id: i % 2 === 0 ? 'user-1' : 'user-2',
      user_facing: i % 3 === 0,
      affects_multiple_users: i % 5 === 0
    });
  }
  
  return logs;
}

/**
 * Mock error trends data for charts
 */
export const mockErrorTrends: ErrorTrendDataPoint[] = (() => {
  const result: ErrorTrendDataPoint[] = [];
  const now = new Date();
  
  for (let i = 14; i >= 0; i--) {
    const date = addDays(now, -i);
    const total = Math.floor(Math.random() * 30) + 5;
    const critical = Math.floor(Math.random() * 5);
    const high = Math.floor(Math.random() * 8) + 2;
    const medium = Math.floor(Math.random() * 10) + 3;
    const low = total - critical - high - medium;
    
    result.push({
      date: format(date, 'yyyy-MM-dd'),
      total,
      critical,
      high,
      medium,
      low
    });
  }
  
  return result;
})();

/**
 * Creates mock error group data for testing
 */
export function createMockErrorGroups(count: number = 5) {
  const groups = [];
  
  for (let i = 0; i < count; i++) {
    groups.push({
      id: `group-${i}`,
      error_type: ['ValidationError', 'NetworkError', 'DatabaseError', 'AuthError', 'UnknownError'][i % 5],
      message: `Mock error group #${i}`,
      count: Math.floor(Math.random() * 100) + 10,
      severity: ['critical', 'high', 'medium', 'low'][i % 4],
      first_seen: addDays(new Date(), -30).toISOString(),
      last_seen: addDays(new Date(), -i).toISOString(),
      affected_users: Math.floor(Math.random() * 20) + 1,
      affected_tenants: Math.floor(Math.random() * 5) + 1,
      modules: ['system', 'api', 'auth', 'database'].slice(0, (i % 4) + 1),
      examples: createMockErrorLogs(2)
    });
  }
  
  return groups;
}
