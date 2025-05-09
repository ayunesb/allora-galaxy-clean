
// Modified to fix type compatibility issues
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange as SharedDateRange } from "@/types/shared";
import { DateRange as CalendarDateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface DateRangePickerProps {
  dateRange: SharedDateRange | undefined;
  onChange: (dateRange: SharedDateRange | undefined) => void;
}

export function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Convert between react-day-picker DateRange and our SharedDateRange
  const handleCalendarSelect = (range: CalendarDateRange | undefined) => {
    if (!range) {
      onChange(undefined);
      return;
    }
    
    // Only process if from is defined (required in our SharedDateRange)
    if (range.from) {
      // Ensure we're always using a defined "from" date in our shared range
      const sharedRange: SharedDateRange = {
        from: range.from,
        to: range.to // This can be undefined, which is fine as our SharedDateRange allows undefined "to"
      };
      
      onChange(sharedRange);
      if (range.from && range.to) {
        setIsOpen(false);
      }
    }
  };

  // Convert our SharedDateRange to react-day-picker DateRange
  const calendarValue: CalendarDateRange | undefined = dateRange ? {
    from: dateRange.from,
    to: dateRange.to
  } : undefined;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          selected={calendarValue}
          onSelect={handleCalendarSelect}
          numberOfMonths={2}
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
