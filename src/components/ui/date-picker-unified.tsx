
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  /** Date value */
  value?: Date | null;
  /** Default initial date */
  defaultValue?: Date;
  /** Callback when date changes */
  onChange?: (date: Date | null) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Optional className for custom styling */
  className?: string;
  /** Popover alignment */
  align?: "start" | "center" | "end";
  /** Whether the date picker is disabled */
  disabled?: boolean;
  /** Format to display the date, defaults to "PPP" */
  dateFormat?: string;
}

/**
 * Unified Date Picker component
 */
export function DatePicker({
  value,
  onChange,
  defaultValue,
  placeholder = "Pick a date",
  className,
  align = "start",
  disabled = false,
  dateFormat = "PPP"
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | null | undefined>(
    value !== undefined ? value : defaultValue
  );

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setDate(value);
    }
  }, [value]);

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, dateFormat) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={handleDateChange}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
