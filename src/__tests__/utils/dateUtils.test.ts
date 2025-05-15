
import { 
  generateDateRange, 
  formatDay, 
  getDayStart, 
  getDayEnd, 
  isDateInDay 
} from '@/components/admin/errors/utils/dateUtils';

describe('dateUtils', () => {
  test('generateDateRange returns all days in a date range', () => {
    const from = new Date('2025-01-01');
    const to = new Date('2025-01-03');
    
    const days = generateDateRange({ from, to });
    
    expect(days.length).toBe(3);
    expect(days[0].toISOString().substring(0, 10)).toBe('2025-01-01');
    expect(days[1].toISOString().substring(0, 10)).toBe('2025-01-02');
    expect(days[2].toISOString().substring(0, 10)).toBe('2025-01-03');
  });

  test('generateDateRange returns empty array when "to" is undefined', () => {
    const from = new Date('2025-01-01');
    const days = generateDateRange({ from, to: undefined });
    expect(days).toEqual([]);
  });

  test('formatDay formats a date correctly', () => {
    const day = new Date('2025-01-15');
    expect(formatDay(day)).toBe('Jan 15');
  });

  test('getDayStart returns start of day', () => {
    const day = new Date('2025-01-15T12:30:45');
    const startOfDay = getDayStart(day);
    
    expect(startOfDay.getHours()).toBe(0);
    expect(startOfDay.getMinutes()).toBe(0);
    expect(startOfDay.getSeconds()).toBe(0);
    expect(startOfDay.getMilliseconds()).toBe(0);
  });

  test('getDayEnd returns end of day', () => {
    const day = new Date('2025-01-15T12:30:45');
    const endOfDay = getDayEnd(day);
    
    expect(endOfDay.getHours()).toBe(23);
    expect(endOfDay.getMinutes()).toBe(59);
    expect(endOfDay.getSeconds()).toBe(59);
    expect(endOfDay.getMilliseconds()).toBe(999);
  });

  test('isDateInDay correctly identifies if a date falls within a day', () => {
    const day = new Date('2025-01-15');
    const dayStart = getDayStart(day);
    const dayEnd = getDayEnd(day);
    
    // Date within the day
    const dateInDay = new Date('2025-01-15T12:00:00');
    expect(isDateInDay(dateInDay, dayStart, dayEnd)).toBe(true);
    
    // Date before the day
    const dateBefore = new Date('2025-01-14T23:59:59');
    expect(isDateInDay(dateBefore, dayStart, dayEnd)).toBe(false);
    
    // Date after the day
    const dateAfter = new Date('2025-01-16T00:00:00');
    expect(isDateInDay(dateAfter, dayStart, dayEnd)).toBe(false);
    
    // Edge cases - exactly at start and end
    expect(isDateInDay(dayStart, dayStart, dayEnd)).toBe(true);
    expect(isDateInDay(dayEnd, dayStart, dayEnd)).toBe(true);
  });
});
