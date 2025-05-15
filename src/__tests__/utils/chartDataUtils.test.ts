
import { describe, test, expect } from 'vitest';
import { prepareErrorTrendsData } from '@/components/admin/errors/utils/chartDataUtils';
import type { SystemLog, LogLevel } from '@/types/logs';

describe('chartDataUtils', () => {
  const testLogs: SystemLog[] = [
    { 
      id: '1', 
      level: 'error' as LogLevel,
      severity: 'critical',
      created_at: '2023-06-01T10:00:00Z', 
      timestamp: '2023-06-01T10:00:00Z',
      module: 'ui',
      description: 'Critical error',
      message: 'Critical error',
      tenant_id: 'test-tenant',
      event: 'error',
      event_type: 'error',
      context: {}
    },
    { 
      id: '2', 
      level: 'warning' as LogLevel,
      severity: 'high',
      created_at: '2023-06-01T12:00:00Z', 
      timestamp: '2023-06-01T12:00:00Z',
      module: 'api',
      description: 'High warning',
      message: 'High warning',
      tenant_id: 'test-tenant',
      event: 'warning',
      event_type: 'warning',
      context: {}
    },
    { 
      id: '3', 
      level: 'info' as LogLevel,
      severity: 'medium',
      created_at: '2023-06-02T10:00:00Z', 
      timestamp: '2023-06-02T10:00:00Z',
      module: 'database',
      description: 'Medium info',
      message: 'Medium info',
      tenant_id: 'test-tenant',
      event: 'info',
      event_type: 'info',
      context: {}
    },
    { 
      id: '4', 
      level: 'error' as LogLevel,
      severity: 'low',
      created_at: '2023-06-03T14:00:00Z',
      timestamp: '2023-06-03T14:00:00Z',
      module: 'auth',
      description: 'Low error',
      message: 'Low error',
      tenant_id: 'test-tenant',
      event: 'error',
      event_type: 'error',
      context: {}
    }
  ];

  test('prepareErrorTrendsData filters logs by date range', () => {
    const startDate = new Date('2023-06-01');
    const endDate = new Date('2023-06-02');
    
    const result = prepareErrorTrendsData(testLogs, { from: startDate, to: endDate });
    
    expect(result.length).toBe(2); // Should have 2 days of data
    expect(result[0].date).toBe('2023-06-01');
    expect(result[1].date).toBe('2023-06-02');
  });

  test('prepareErrorTrendsData groups logs by date correctly', () => {
    const startDate = new Date('2023-06-01');
    const endDate = new Date('2023-06-03');
    
    const result = prepareErrorTrendsData(testLogs, { from: startDate, to: endDate });
    
    expect(result.length).toBe(3); // Three different dates
    expect(result[0].date).toBe('2023-06-01');
    expect(result[0].total).toBe(1); // One error on June 1
    expect(result[0].critical).toBe(1); // One critical error
    expect(result[0].high).toBe(0); // No high errors (the high severity log is a warning)
  });

  test('prepareErrorTrendsData aggregates by severity correctly', () => {
    const startDate = new Date('2023-06-01');
    const endDate = new Date('2023-06-03');
    
    const result = prepareErrorTrendsData(testLogs, { from: startDate, to: endDate });
    
    // First day - June 1
    expect(result[0].critical).toBe(1);
    expect(result[0].high).toBe(0);
    expect(result[0].medium).toBe(0);
    expect(result[0].low).toBe(0);
    
    // Third day - June 3
    expect(result[2].critical).toBe(0);
    expect(result[2].high).toBe(0);
    expect(result[2].medium).toBe(0);
    expect(result[2].low).toBe(1);
  });
});
