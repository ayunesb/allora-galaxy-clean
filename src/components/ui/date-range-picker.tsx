
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange as DayPickerDateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "@/types/shared";

// Define a compatible type for the onSelect handler
export type SelectRangeEventHandler = (range: DayPickerDateRange | undefined) => void;

export interface DateRangePickerProps {
  className?: string;
  value?: DateRange;
  onSelect?: SelectRangeEventHandler;
  placeholder?: string;
  showCompare?: boolean;
  align?: "start" | "center" | "end";
  locale?: string;
}

export function DateRangePicker({
  className,
  value,
  onSelect,
  placeholder = "Select date range",
  align = "start",
  locale = "en-US",
  ...props
}: DateRangePickerProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>) {
  const [date, setDate] = React.useState<DayPickerDateRange | undefined>(value as DayPickerDateRange);

  // When the value changes, call onSelect with the new value
  React.useEffect(() => {
    if (value) {
      setDate(value as DayPickerDateRange);
    }
  }, [value]);

  // Handle changes to the date range
  const handleSelect = (selectedDate: DayPickerDateRange | undefined) => {
    setDate(selectedDate);
    if (onSelect) {
      onSelect(selectedDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
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
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
