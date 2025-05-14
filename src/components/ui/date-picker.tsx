
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
import { DateRange as DayPickerDateRange } from "react-day-picker";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DatePickerProps {
  selected?: Date | null | DateRange;
  onSelect?: (date: Date | DateRange) => void;
  mode?: 'single' | 'range';
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  selected,
  onSelect,
  mode = 'single',
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | null>(
    mode === 'single' && selected && !(selected as DateRange).from ? selected as Date : null
  );
  const [dateRange, setDateRange] = React.useState<DateRange>(
    mode === 'range' && selected && (selected as DateRange).from 
      ? selected as DateRange 
      : { from: null, to: null }
  );
  
  const handleSelect = (value: Date | DateRange) => {
    if (mode === 'single') {
      setDate(value as Date);
    } else {
      setDateRange(value as DateRange);
    }
    
    if (onSelect) {
      onSelect(value);
    }
  };

  const getDisplayValue = () => {
    if (mode === 'single') {
      return date ? format(date, "PPP") : placeholder;
    } else {
      const { from, to } = dateRange;
      if (from && to) {
        return `${format(from, "PPP")} - ${format(to, "PPP")}`;
      } else if (from) {
        return `${format(from, "PPP")} - ...`;
      } else {
        return placeholder;
      }
    }
  };

  // Convert our DateRange to DayPicker's DateRange
  const toDayPickerDateRange = (range: DateRange): DayPickerDateRange => {
    return {
      from: range.from || undefined,
      to: range.to || undefined
    };
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
              !date && !dateRange.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayValue()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          {mode === 'single' ? (
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect as (date: Date | undefined) => void}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          ) : (
            <Calendar
              mode="range"
              selected={toDayPickerDateRange(dateRange)}
              onSelect={(range) => {
                if (range) {
                  handleSelect({
                    from: range.from || null,
                    to: range.to || null
                  });
                }
              }}
              initialFocus
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
