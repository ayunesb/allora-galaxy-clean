
import { filterLogsByDateRange, groupLogsByDate, aggregateLogsByPeriod } from '@/components/admin/errors/utils/chartDataUtils';

describe('chartDataUtils', () => {
  const testLogs = [
    { 
      id: '1', 
      level: 'critical', 
      created_at: '2023-06-01T10:00:00Z', 
      module: 'ui'
    },
    { 
      id: '2', 
      level: 'high', 
      created_at: '2023-06-01T12:00:00Z', 
      module: 'api'
    },
    { 
      id: '3', 
      level: 'medium', 
      created_at: '2023-06-02T10:00:00Z', 
      module: 'database'
    },
    { 
      id: '4', 
      level: 'low', 
      created_at: '2023-06-03T14:00:00Z', 
      module: 'auth'
    }
  ];

  test('filterLogsByDateRange filters logs correctly', () => {
    const startDate = new Date('2023-06-01');
    const endDate = new Date('2023-06-02');
    
    const result = filterLogsByDateRange(testLogs, startDate, endDate);
    
    // Should include logs from June 1 and June 2
    expect(result).toHaveLength(3);
    expect(result.map(log => log.id)).toEqual(['1', '2', '3']);
  });

  test('groupLogsByDate groups logs by date correctly', () => {
    const result = groupLogsByDate(testLogs);
    
    expect(Object.keys(result)).toHaveLength(3); // Three different dates
    expect(result['2023-06-01']).toHaveLength(2); // Two logs on June 1
    expect(result['2023-06-02']).toHaveLength(1); // One log on June 2
    expect(result['2023-06-03']).toHaveLength(1); // One log on June 3
  });

  test('aggregateLogsByPeriod aggregates logs correctly', () => {
    const startDate = new Date('2023-06-01');
    const endDate = new Date('2023-06-03');
    
    const result = aggregateLogsByPeriod(testLogs, startDate, endDate, 'day');
    
    expect(result).toHaveLength(3); // Three days
    expect(result[0].date).toBe('2023-06-01');
    expect(result[0].total).toBe(2);
    expect(result[0].critical).toBe(1);
    expect(result[0].high).toBe(1);
    expect(result[0].medium).toBe(0);
    expect(result[0].low).toBe(0);
    
    expect(result[1].date).toBe('2023-06-02');
    expect(result[1].total).toBe(1);
    expect(result[1].critical).toBe(0);
    expect(result[1].high).toBe(0);
    expect(result[1].medium).toBe(1);
    expect(result[1].low).toBe(0);
    
    expect(result[2].date).toBe('2023-06-03');
    expect(result[2].total).toBe(1);
    expect(result[2].critical).toBe(0);
    expect(result[2].high).toBe(0);
    expect(result[2].medium).toBe(0);
    expect(result[2].low).toBe(1);
  });
});
