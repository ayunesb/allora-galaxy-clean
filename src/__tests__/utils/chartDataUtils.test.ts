
import { prepareErrorTrendsData } from '@/components/admin/errors/utils/chartDataUtils';
import type { SystemLog } from '@/types/logs';
import { addDays } from 'date-fns';

// Mock the imported utility functions
jest.mock('@/components/admin/errors/utils/dateUtils', () => ({
  generateDateRange: jest.fn(() => [new Date('2025-01-01'), new Date('2025-01-02')]),
  formatDay: jest.fn((day) => {
    if (day.toISOString().includes('2025-01-01')) return 'Jan 01';
    return 'Jan 02';
  }),
  getDayStart: jest.fn((day) => {
    if (day.toISOString().includes('2025-01-01')) return new Date('2025-01-01T00:00:00');
    return new Date('2025-01-02T00:00:00');
  }),
  getDayEnd: jest.fn((day) => {
    if (day.toISOString().includes('2025-01-01')) return new Date('2025-01-01T23:59:59.999');
    return new Date('2025-01-02T23:59:59.999');
  }),
  isDateInDay: jest.fn((date, dayStart, dayEnd) => {
    const dateStr = date.toISOString();
    const dayStartStr = dayStart.toISOString();
    return dateStr.substring(0, 10) === dayStartStr.substring(0, 10);
  })
}));

jest.mock('@/components/admin/errors/utils/severityUtils', () => ({
  countLogsBySeverity: jest.fn(() => ({
    criticalCount: 1,
    highCount: 2,
    mediumCount: 3,
    lowCount: 4
  })),
  countLogsByErrorType: jest.fn(() => ({
    'SQL_ERROR': 3,
    'API_ERROR': 2,
    'NETWORK_ERROR': 1
  })),
  getTopErrorTypes: jest.fn(() => ({
    'SQL_ERROR': 3,
    'API_ERROR': 2,
    'NETWORK_ERROR': 1
  }))
}));

describe('chartDataUtils', () => {
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
      created_at: '2025-01-02T01:00:00Z',
      level: 'error',
      severity: 'high',
      module: 'api',
      error_type: 'API_ERROR',
      event: 'api_request_failed',
      message: 'API request failed',
      description: 'Unable to reach external API',
    },
  ];

  test('prepareErrorTrendsData returns formatted data for chart', () => {
    const from = new Date('2025-01-01');
    const to = addDays(from, 1);
    
    const chartData = prepareErrorTrendsData(mockLogs, { from, to });
    
    expect(chartData.length).toBe(2);
    
    expect(chartData[0].date).toBe('Jan 01');
    expect(chartData[0].total).toBe(1);
    expect(chartData[0].critical).toBe(1);
    expect(chartData[0].high).toBe(2);
    expect(chartData[0].medium).toBe(3);
    expect(chartData[0].low).toBe(4);
    expect(chartData[0]['SQL_ERROR']).toBe(3);
    expect(chartData[0]['API_ERROR']).toBe(2);
    
    expect(chartData[1].date).toBe('Jan 02');
    expect(chartData[1].total).toBe(1);
    expect(chartData[1].critical).toBe(1);
  });

  test('prepareErrorTrendsData returns empty array when to date is undefined', () => {
    const result = prepareErrorTrendsData(mockLogs, { from: new Date(), to: undefined });
    expect(result).toEqual([]);
  });
});
