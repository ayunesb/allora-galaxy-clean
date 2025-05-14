
import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function convertDateRange(range?: DateRange): { start_date?: string; end_date?: string } {
  if (!range) return {};
  
  const result: { start_date?: string; end_date?: string } = {};
  
  if (range.from) {
    result.start_date = range.from.toISOString();
  }
  
  if (range.to) {
    result.end_date = range.to.toISOString();
  }
  
  return result;
}

export type SelectRangeEventHandler = (range?: DateRange) => void;

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: DateRange;
  onSelect: SelectRangeEventHandler;
  align?: "start" | "center" | "end";
  locale?: string;
  showCompact?: boolean;
}

export function DateRangePicker({
  date,
  onSelect,
  align = "start",
  className,
  locale,
  showCompact = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (range?: DateRange) => {
    onSelect(range);
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  // Format date for display
  const dateFormat = showCompact ? "MMM d" : "LLL dd, y";
  
  const formatDate = (date?: Date, defaultText: string = "Pick a date") => {
    if (!date) return defaultText;
    return format(date, dateFormat, { locale });
  };

  const displayText = React.useMemo(() => {
    if (!date?.from) {
      return showCompact ? "Date range" : "Select date range";
    }

    if (date.to) {
      return `${formatDate(date.from)} - ${formatDate(date.to)}`;
    }

    return `${formatDate(date.from)} - ?`;
  }, [date, showCompact]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              showCompact && "h-8 text-xs"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
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
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
