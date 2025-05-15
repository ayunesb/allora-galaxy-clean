
import { describe, it, expect, vi } from 'vitest';
import { 
  formatDateToISO,
  parseISO,
  formatDateDisplay,
  getDateRangeFromPeriod,
  getTimePeriodLabel
} from '@/components/admin/errors/utils/dateUtils';

describe('dateUtils', () => {
  it('should format date to ISO', () => {
    const date = new Date('2023-01-01');
    expect(formatDateToISO(date)).toBe('2023-01-01T00:00:00.000Z');
  });
  
  it('should parse ISO string to date', () => {
    const isoDate = '2023-01-01T00:00:00.000Z';
    const date = parseISO(isoDate);
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(0); // January is 0
    expect(date.getDate()).toBe(1);
  });
  
  it('should format date for display', () => {
    const date = new Date('2023-01-01');
    expect(formatDateDisplay(date)).toBe('Jan 1, 2023');
  });
  
  it('should get date range from period', () => {
    // Mock Date.now to return a fixed timestamp for testing
    const originalNow = Date.now;
    const mockNow = new Date('2023-01-10').valueOf();
    global.Date.now = vi.fn().mockReturnValue(mockNow);
    
    const day = getDateRangeFromPeriod('24h');
    const week = getDateRangeFromPeriod('7d');
    const month = getDateRangeFromPeriod('30d');
    const year = getDateRangeFromPeriod('1y');
    
    // Verify the calculations
    expect(day.from.toISOString().substring(0, 10)).toBe('2023-01-09');
    expect(day.to.toISOString().substring(0, 10)).toBe('2023-01-10');
    
    expect(week.from.toISOString().substring(0, 10)).toBe('2023-01-03');
    expect(week.to.toISOString().substring(0, 10)).toBe('2023-01-10');
    
    expect(month.from.toISOString().substring(0, 10)).toBe('2022-12-11');
    expect(month.to.toISOString().substring(0, 10)).toBe('2023-01-10');
    
    expect(year.from.toISOString().substring(0, 10)).toBe('2022-01-10');
    expect(year.to.toISOString().substring(0, 10)).toBe('2023-01-10');
    
    // Restore original function
    global.Date.now = originalNow;
  });
  
  it('should get time period labels', () => {
    expect(getTimePeriodLabel('24h')).toBe('Last 24 hours');
    expect(getTimePeriodLabel('7d')).toBe('Last 7 days');
    expect(getTimePeriodLabel('30d')).toBe('Last 30 days');
    expect(getTimePeriodLabel('1y')).toBe('Last year');
  });
});
