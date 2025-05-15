
import { describe, test, expect, beforeEach } from 'vitest';
import { prepareErrorTrendsData } from '@/components/admin/errors/utils/chartDataUtils';
import type { SystemLog } from '@/types/logs';
import { addDays, subDays, startOfDay, endOfDay, format } from 'date-fns';

// Mock SystemLog data
const mockErrorLogs: SystemLog[] = [
  {
    id: '1',
    tenant_id: 'tenant1',
    level: 'error',
    module: 'system',
    message: 'Database connection failed',
    created_at: new Date('2023-01-01T10:30:00Z').toISOString(),
    error_type: 'DB_ERROR',
    severity: 'high'
  },
  {
    id: '2',
    tenant_id: 'tenant1',
    level: 'error',
    module: 'api',
    message: 'API request timeout',
    created_at: new Date('2023-01-01T14:45:00Z').toISOString(),
    error_type: 'TIMEOUT_ERROR',
    severity: 'medium'
  },
  {
    id: '3',
    tenant_id: 'tenant1',
    level: 'error',
    module: 'system',
    message: 'SQL query error',
    created_at: new Date('2023-01-02T09:15:00Z').toISOString(),
    error_type: 'SQL_ERROR',
    severity: 'critical'
  },
  {
    id: '4',
    tenant_id: 'tenant1',
    level: 'error',
    module: 'api',
    message: 'Authentication failed',
    created_at: new Date('2023-01-02T16:20:00Z').toISOString(),
    error_type: 'AUTH_ERROR',
    severity: 'high'
  },
  {
    id: '5',
    tenant_id: 'tenant1',
    level: 'error',
    module: 'ui',
    message: 'UI rendering error',
    created_at: new Date('2023-01-03T11:10:00Z').toISOString(),
    error_type: 'RENDER_ERROR',
    severity: 'low'
  }
];

describe('chartDataUtils', () => {
  // Define date range for tests
  const today = new Date();
  const startDate = startOfDay(subDays(today, 5));
  const endDate = endOfDay(today);

  test('prepareErrorTrendsData should group errors by date and severity', () => {
    const result = prepareErrorTrendsData(mockErrorLogs, { 
      from: new Date('2023-01-01T00:00:00Z'), 
      to: new Date('2023-01-03T23:59:59Z') 
    });
    
    // Expect 3 days of data
    expect(result.length).toBe(3);
    
    // Check first day's data
    expect(result[0].date).toBe('2023-01-01');
    expect(result[0].total).toBe(2);
    expect(result[0].critical).toBe(0);
    expect(result[0].high).toBe(1);
    expect(result[0].medium).toBe(1);
    expect(result[0].low).toBe(0);
    
    // Check specific error types
    const day2 = result.find(d => d.date === '2023-01-02');
    expect(day2?.total).toBe(2);
    expect(day2?.critical).toBe(1);
  });

  test('prepareErrorTrendsData should handle empty logs', () => {
    const result = prepareErrorTrendsData([], { from: startDate, to: endDate });
    
    // Should return array with entries for each date in range
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(day => day.total === 0)).toBe(true);
  });

  test('prepareErrorTrendsData should fill in missing dates', () => {
    // Create a bigger gap in the test data
    const sparseData: SystemLog[] = [
      mockErrorLogs[0], // 2023-01-01
      {
        ...mockErrorLogs[4],
        created_at: new Date('2023-01-06T11:10:00Z').toISOString()
      }
    ];
    
    const result = prepareErrorTrendsData(sparseData, {
      from: new Date('2023-01-01T00:00:00Z'),
      to: new Date('2023-01-06T23:59:59Z')
    });
    
    // Should have entries for all 6 days
    expect(result.length).toBe(6);
    
    // Check first and last day have data
    expect(result[0].total).toBe(1);
    expect(result[5].total).toBe(1);
    
    // Middle days should be zero
    expect(result[1].total).toBe(0);
    expect(result[2].total).toBe(0);
    expect(result[3].total).toBe(0);
    expect(result[4].total).toBe(0);
  });
});
