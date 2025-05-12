
import { DateRange as DayPickerDateRange } from 'react-day-picker';

export interface DateRange {
  from: Date;
  to?: Date;
}

// Convert from react-day-picker DateRange to our DateRange
export function convertDateRange(dayPickerRange?: DayPickerDateRange): DateRange | undefined {
  if (!dayPickerRange || !dayPickerRange.from) return undefined;
  return {
    from: dayPickerRange.from,
    to: dayPickerRange.to
  };
}
