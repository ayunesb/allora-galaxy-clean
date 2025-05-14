
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  /** Current selected date value */
  value?: Date | null;
  /** Default date if no value is provided */
  defaultValue?: Date;
  /** Callback when date is changed */
  onChange?: (date: Date | null) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Additional class names */
  className?: string;
  /** Popover content alignment */
  align?: "start" | "center" | "end";
  /** Whether the date picker is disabled */
  disabled?: boolean;
  /** Disable specific dates */
  disabledDates?: (date: Date) => boolean;
}

/**
 * Unified date picker component for selecting a single date
 */
export function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Pick a date",
  className,
  align = "start",
  disabled = false,
  disabledDates,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | null | undefined>(
    value !== undefined ? value : defaultValue
  );

  // Update local state when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setDate(value);
    }
  }, [value]);

  // Handle date selection
  const handleSelect: SelectSingleEventHandler = (selectedDate) => {
    setDate(selectedDate);
    if (onChange) {
      onChange(selectedDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={handleSelect}
          initialFocus
          disabled={disabled || disabledDates}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
