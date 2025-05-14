
import { DateRange as DayPickerDateRange } from "react-day-picker";

/**
 * Unified DateRange type with guaranteed from date
 */
export interface DateRange {
  from: Date;
  to?: Date;
}

/**
 * For use with nullable date ranges
 */
export interface NullableDateRange {
  from: Date | null;
  to: Date | null;
}

/**
 * For pre-defined date range presets
 */
export interface DateRangePreset {
  name: string;
  label: string;
  range: () => DateRange;
}

/**
 * Type guard to check if a value is a valid DateRange
 */
export function isDateRange(value: any): value is DateRange {
  return (
    typeof value === 'object' &&
    value !== null &&
    'from' in value &&
    value.from instanceof Date &&
    (value.to === undefined || value.to instanceof Date)
  );
}

/**
 * Convert a DayPickerDateRange to our DateRange
 */
export function toDomainDateRange(range: DayPickerDateRange | undefined): DateRange | undefined {
  if (!range || !range.from) return undefined;
  
  return {
    from: range.from,
    to: range.to
  };
}

/**
 * Convert our DateRange to DayPickerDateRange
 */
export function toDayPickerDateRange(range: DateRange | undefined): DayPickerDateRange | undefined {
  if (!range) return undefined;
  
  return {
    from: range.from,
    to: range.to
  };
}
