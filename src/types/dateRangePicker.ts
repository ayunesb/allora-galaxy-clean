
import { DateRange as DayPickerDateRange } from "react-day-picker";

// Extend the DateRange type to make sure 'from' is always a Date
export interface DateRange extends DayPickerDateRange {
  from: Date;
}

// For use with empty date ranges
export interface NullableDateRange {
  from: Date | null;
  to: Date | null;
}

// For pre-defined date ranges
export interface DateRangePreset {
  name: string;
  label: string;
  range: () => DateRange;
}
