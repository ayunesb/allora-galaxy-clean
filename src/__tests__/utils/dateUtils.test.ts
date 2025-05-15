
import { 
  formatDateToISO, 
  parseISO, 
  formatDateDisplay,
  getDateRangeFromPeriod,
  getTimePeriodLabel
} from '@/components/admin/errors/utils/dateUtils';
import { addDays, subDays } from 'date-fns';

describe('dateUtils', () => {
  test('formatDateToISO formats dates correctly', () => {
    const date = new Date('2023-06-15T12:30:00Z');
    const result = formatDateToISO(date);
    
    // Should return ISO format: YYYY-MM-DD
    expect(result).toBe('2023-06-15');
  });
  
  test('parseISO parses ISO strings correctly', () => {
    const isoString = '2023-06-15';
    const result = parseISO(isoString);
    
    expect(result instanceof Date).toBe(true);
    expect(result.getUTCFullYear()).toBe(2023);
    expect(result.getUTCMonth()).toBe(5); // June (0-indexed)
    expect(result.getUTCDate()).toBe(15);
  });
  
  test('formatDateDisplay formats dates for display', () => {
    const date = new Date('2023-06-15T12:30:00Z');
    const result = formatDateDisplay(date);
    
    // Should format as "Jun 15, 2023"
    expect(result).toMatch(/Jun 15, 2023/);
  });
  
  test('getDateRangeFromPeriod calculates correct date ranges', () => {
    // Mock the current date to make the test predictable
    const originalDate = Date;
    global.Date = class extends Date {
      constructor(date) {
        if (date) {
          return super(date);
        }
        return new originalDate('2023-06-15T12:00:00Z');
      }
    };
    
    // Test "7d" period (last 7 days)
    let result = getDateRangeFromPeriod('7d');
    expect(result.from instanceof Date).toBe(true);
    expect(result.to instanceof Date).toBe(true);
    expect(result.from.toISOString().substring(0, 10)).toBe('2023-06-08');
    expect(result.to.toISOString().substring(0, 10)).toBe('2023-06-15');
    
    // Test "30d" period (last 30 days)
    result = getDateRangeFromPeriod('30d');
    expect(result.from.toISOString().substring(0, 10)).toBe('2023-05-16');
    expect(result.to.toISOString().substring(0, 10)).toBe('2023-06-15');
    
    // Restore original Date
    global.Date = originalDate;
  });
  
  test('getTimePeriodLabel returns correct labels', () => {
    expect(getTimePeriodLabel('24h')).toBe('Last 24 hours');
    expect(getTimePeriodLabel('7d')).toBe('Last 7 days');
    expect(getTimePeriodLabel('30d')).toBe('Last 30 days');
    expect(getTimePeriodLabel('90d')).toBe('Last 90 days');
    expect(getTimePeriodLabel('custom')).toBe('Custom range');
    expect(getTimePeriodLabel('unknown')).toBe('Custom');
  });
});
