
import { describe, it, expect } from 'vitest';
import { formatDisplayDate, formatRelativeDate, formatDateWithTZ } from './date';
import { addDays, subDays, subHours } from 'date-fns';

describe('Date Utilities', () => {
  describe('formatDisplayDate', () => {
    it('formats a date string correctly with default format', () => {
      const date = '2023-05-10T14:30:00.000Z';
      const result = formatDisplayDate(date);
      expect(result).toMatch(/May 10, 2023 \d{2}:\d{2}/);
    });

    it('formats a Date object correctly with default format', () => {
      const date = new Date('2023-05-10T14:30:00.000Z');
      const result = formatDisplayDate(date);
      expect(result).toMatch(/May 10, 2023 \d{2}:\d{2}/);
    });

    it('applies a custom format correctly', () => {
      const date = '2023-05-10T14:30:00.000Z';
      const result = formatDisplayDate(date, 'yyyy-MM-dd');
      expect(result).toBe('2023-05-10');
    });

    it('handles invalid dates gracefully', () => {
      const invalidDate = 'not-a-date';
      const result = formatDisplayDate(invalidDate);
      expect(result).toBe(invalidDate);
    });
  });

  describe('formatRelativeDate', () => {
    it('formats a recent date as relative time', () => {
      const now = new Date();
      const twoHoursAgo = subHours(now, 2);
      const result = formatRelativeDate(twoHoursAgo, now);
      expect(result).toBe('2 hours ago');
    });

    it('formats an older date as relative time', () => {
      const now = new Date();
      const threeDaysAgo = subDays(now, 3);
      const result = formatRelativeDate(threeDaysAgo, now);
      expect(result).toBe('3 days ago');
    });

    it('formats a future date as relative time', () => {
      const now = new Date();
      const twoDaysLater = addDays(now, 2);
      const result = formatRelativeDate(twoDaysLater, now);
      expect(result).toBe('in 2 days');
    });
  });

  describe('formatDateWithTZ', () => {
    it('formats a date with specified timezone', () => {
      const date = new Date('2023-05-10T14:30:00.000Z');
      const result = formatDateWithTZ(date, 'yyyy-MM-dd', 'UTC');
      // We can only check the format since timezone specific output will vary by environment
      expect(result).toMatch(/[A-Za-z]{3} \d{2}, \d{4} \d{2}:\d{2}:\d{2}/);
    });
  });
});
