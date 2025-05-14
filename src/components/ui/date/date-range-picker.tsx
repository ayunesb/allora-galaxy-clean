
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange as DayPickerRange, SelectRangeEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "@/types/date";
import { toDayPickerDateRange, toDomainDateRange } from "@/types/date";

export interface DateRangePickerProps {
  /** Current date range value */
  dateRange?: DateRange;
  /** Default date range if no value is provided */
  defaultValue?: DateRange;
  /** Callback when date range is changed */
  setDateRange?: (range: DateRange | undefined) => void;
  /** Placeholder text when no date range is selected */
  placeholder?: string;
  /** Additional class names */
  className?: string;
  /** Popover content alignment */
  align?: "start" | "center" | "end";
  /** Whether the date range picker is disabled */
  disabled?: boolean;
  /** Number of months to display */
  numberOfMonths?: number;
  /** Disable specific dates */
  disabledDates?: (date: Date) => boolean;
}

/**
 * Unified date range picker component for selecting a date range
 */
export function DateRangePicker({
  dateRange,
  defaultValue,
  setDateRange,
  placeholder = "Pick a date range",
  className,
  align = "start",
  disabled = false,
  numberOfMonths = 2,
  disabledDates,
}: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(
    dateRange || defaultValue
  );

  // Update local state when dateRange prop changes
  React.useEffect(() => {
    if (dateRange) {
      setSelectedRange(dateRange);
    }
  }, [dateRange]);

  // Handle date range selection
  const handleSelect: SelectRangeEventHandler = (range) => {
    // Convert from DayPicker's DateRange to our DateRange
    const newRange = toDomainDateRange(range);
    
    setSelectedRange(newRange);
    if (setDateRange && newRange) {
      setDateRange(newRange);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedRange?.from ? (
              selectedRange.to ? (
                <>
                  {format(selectedRange.from, "LLL dd, y")} -{" "}
                  {format(selectedRange.to, "LLL dd, y")}
                </>
              ) : (
                format(selectedRange.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedRange?.from}
            selected={toDayPickerDateRange(selectedRange)}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
            disabled={disabled || disabledDates}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateRangePicker;
