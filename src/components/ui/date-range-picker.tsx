
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "@/types/shared";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (value?: DateRange) => void;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Select date range"
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  // Update internal state when external value changes
  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (onChange) {
      onChange(range);
    }
  };

  // Convert our DateRange type to the Calendar component's expected format
  const selectedDates: { from: Date; to?: Date } | undefined = date
    ? { from: date.from, to: date.to }
    : undefined;

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
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={selectedDates}
            onSelect={(selectedRange) => {
              if (selectedRange && 'from' in selectedRange) {
                // Convert to our DateRange type
                handleSelect({ 
                  from: selectedRange.from as Date, 
                  to: selectedRange.to as Date | undefined
                });
              } else {
                handleSelect(undefined);
              }
            }}
            numberOfMonths={2}
          />
          <div className="flex justify-end gap-2 p-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSelect(undefined)}
            >
              Clear
            </Button>
            <Button 
              size="sm" 
              onClick={() => {
                if (date?.from) {
                  const today = new Date();
                  handleSelect({
                    from: date.from,
                    to: today > date.from ? today : date.from
                  });
                }
              }}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
