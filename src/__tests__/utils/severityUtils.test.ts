
import { 
  isCriticalSeverity,
  isHighSeverity,
  isMediumSeverity,
  isLowSeverity,
  countLogsBySeverity,
  countLogsByErrorType,
  getTopErrorTypes
} from '@/components/admin/errors/utils/severityUtils';
import type { SystemLog } from '@/types/logs';

describe('severityUtils', () => {
  // Mock system logs
  const mockLogs: SystemLog[] = [
    {
      id: '1', 
      tenant_id: 'tenant1',
      created_at: '2025-01-01T00:00:00Z',
      level: 'error',
      severity: 'critical',
      module: 'database',
      event: 'query_failed',
      message: 'Database connection error',
      description: 'Failed to connect to the database',
    },
    {
      id: '2',
      tenant_id: 'tenant1',
      created_at: '2025-01-01T01:00:00Z',
      level: 'error',
      severity: 'high',
      module: 'api',
      error_type: 'API_ERROR',
      event: 'api_request_failed',
      message: 'API request failed',
      description: 'Unable to reach external API',
    },
    {
      id: '3',
      tenant_id: 'tenant1',
      created_at: '2025-01-01T02:00:00Z',
      level: 'warning',
      severity: 'medium',
      module: 'system',
      event: 'disk_space_warning',
      message: 'Disk space running low',
      description: 'Less than 10% disk space remaining',
    },
    {
      id: '4',
      tenant_id: 'tenant1',
      created_at: '2025-01-01T03:00:00Z',
      level: 'info',
      severity: 'low',
      module: 'auth',
      event: 'user_login',
      message: 'User logged in',
      description: 'User login successful',
    },
    {
      id: '5',
      tenant_id: 'tenant1',
      created_at: '2025-01-01T04:00:00Z',
      level: 'error',
      module: 'database',
      event: 'query_failed',
      message: 'SQL error',
      error_type: 'SQL_ERROR',
      description: 'Syntax error in query',
    }
  ];

  test('isCriticalSeverity identifies critical errors correctly', () => {
    expect(isCriticalSeverity(mockLogs[0])).toBe(true);
    expect(isCriticalSeverity(mockLogs[1])).toBe(false);
    expect(isCriticalSeverity(mockLogs[4])).toBe(true); // Error without explicit severity defaults to critical
  });

  test('isHighSeverity identifies high severity errors correctly', () => {
    expect(isHighSeverity(mockLogs[0])).toBe(false);
    expect(isHighSeverity(mockLogs[1])).toBe(true);
  });

  test('isMediumSeverity identifies medium severity errors correctly', () => {
    expect(isMediumSeverity(mockLogs[2])).toBe(true);
    expect(isMediumSeverity(mockLogs[0])).toBe(false);
  });

  test('isLowSeverity identifies low severity errors correctly', () => {
    expect(isLowSeverity(mockLogs[3])).toBe(true);
    expect(isLowSeverity(mockLogs[0])).toBe(false);
  });

  test('countLogsBySeverity returns correct counts', () => {
    const counts = countLogsBySeverity(mockLogs);
    expect(counts.criticalCount).toBe(2); // mockLogs[0] and mockLogs[4]
    expect(counts.highCount).toBe(1);
    expect(counts.mediumCount).toBe(1);
    expect(counts.lowCount).toBe(1);
  });

  test('countLogsByErrorType returns correct counts', () => {
    const errorTypes = countLogsByErrorType(mockLogs);
    expect(errorTypes['SQL_ERROR']).toBe(1);
    expect(errorTypes['API_ERROR']).toBe(1);
    expect(errorTypes.error).toBe(1);  // The one without explicit error_type
    expect(errorTypes.warning).toBe(1);
    expect(errorTypes.info).toBe(1);
  });

  test('getTopErrorTypes returns top errors sorted by count', () => {
    const errorTypes = {
      'SQL_ERROR': 5,
      'API_ERROR': 3,
      'NETWORK_ERROR': 7,
      'AUTH_ERROR': 2,
      'VALIDATION_ERROR': 1
    };
    
    const top3 = getTopErrorTypes(errorTypes, 3);
    
    expect(Object.keys(top3).length).toBe(3);
    expect(top3['NETWORK_ERROR']).toBe(7);
    expect(top3['SQL_ERROR']).toBe(5);
    expect(top3['API_ERROR']).toBe(3);
    expect(top3['AUTH_ERROR']).toBeUndefined();
  });
});
