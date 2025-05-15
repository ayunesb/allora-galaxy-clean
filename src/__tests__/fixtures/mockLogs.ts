
import { SystemLog } from '@/types/logs';

/**
 * Mock system logs for testing purposes
 */
export const mockSystemLogs: SystemLog[] = [
  {
    id: '1',
    tenant_id: 'tenant-1',
    level: 'error',
    message: 'Database connection failed',
    description: 'Failed to connect to the database after 3 retries',
    module: 'database',
    details: {
      connectionString: 'postgresql://localhost:5432/db',
      retries: 3,
      errorCode: 'ECONNREFUSED'
    },
    created_at: '2023-01-01T10:00:00Z',
    severity: 'critical',
    request_id: 'req-123',
    timestamp: '2023-01-01T10:00:00Z'
  },
  {
    id: '2',
    tenant_id: 'tenant-1',
    level: 'warning',
    message: 'API rate limit approaching',
    description: 'Current usage at 80% of rate limit',
    module: 'api',
    details: {
      endpoint: '/users',
      usageRate: 0.8,
      limitReset: '2023-01-01T11:00:00Z'
    },
    created_at: '2023-01-01T10:15:00Z',
    severity: 'medium',
    request_id: 'req-124',
    timestamp: '2023-01-01T10:15:00Z'
  },
  {
    id: '3',
    tenant_id: 'tenant-1',
    level: 'info',
    message: 'User logged in successfully',
    module: 'auth',
    details: {
      userId: 'user-123',
      method: 'password'
    },
    created_at: '2023-01-01T10:30:00Z',
    severity: 'low',
    request_id: 'req-125',
    timestamp: '2023-01-01T10:30:00Z'
  },
  {
    id: '4',
    tenant_id: 'tenant-2',
    level: 'error',
    message: 'Payment processing failed',
    description: 'Credit card declined by payment processor',
    module: 'payments',
    details: {
      paymentId: 'pay-456',
      errorCode: 'card_declined',
      processor: 'stripe'
    },
    created_at: '2023-01-01T11:00:00Z',
    severity: 'high',
    request_id: 'req-126',
    timestamp: '2023-01-01T11:00:00Z'
  },
  {
    id: '5',
    tenant_id: 'tenant-2',
    level: 'debug',
    message: 'Cache miss for user profile',
    module: 'cache',
    details: {
      userId: 'user-789',
      cacheKey: 'profile:user-789'
    },
    created_at: '2023-01-01T11:30:00Z',
    severity: 'low',
    timestamp: '2023-01-01T11:30:00Z'
  }
];

/**
 * Mock partial logs with minimal data for specific test cases
 */
export const mockPartialLogs: Partial<SystemLog>[] = [
  {
    id: '6',
    tenant_id: 'tenant-3',
    level: 'error',
    message: 'Minimal error log',
    created_at: '2023-01-02T09:00:00Z',
    timestamp: '2023-01-02T09:00:00Z'
  },
  {
    id: '7',
    tenant_id: 'tenant-3',
    level: 'info',
    message: 'Minimal info log',
    created_at: '2023-01-02T09:15:00Z',
    timestamp: '2023-01-02T09:15:00Z'
  }
];

/**
 * Factory function to create custom mock logs for testing
 * @param overrides - Properties to override in the base log
 * @returns A mock system log with custom properties
 */
export function createMockLog(overrides: Partial<SystemLog> = {}): SystemLog {
  return {
    id: `log-${Date.now()}`,
    tenant_id: 'tenant-test',
    level: 'info',
    message: 'Test log message',
    created_at: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    ...overrides
  };
}

export default mockSystemLogs;
