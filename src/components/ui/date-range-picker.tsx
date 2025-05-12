
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "@/types/shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (value?: DateRange) => void;
  className?: string;
  align?: "start" | "center" | "end";
}

export function DateRangePicker({
  value,
  onChange,
  className,
  align = "start",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Format the date range for display
  const formatDateRange = () => {
    if (!value?.from) return "Select date range";
    
    if (!value.to) {
      return format(value.from, "PPP");
    }

    return `${format(value.from, "PPP")} - ${format(value.to, "PPP")}`;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={{
              from: value?.from || new Date(),
              to: value?.to,
            }}
            onSelect={(range) => {
              if (range?.from && range.to) {
                onChange({ 
                  from: range.from, 
                  to: range.to 
                });
              } else if (range?.from) {
                onChange({ 
                  from: range.from 
                });
              } else {
                onChange(undefined);
              }
              setIsOpen(false);
            }}
            numberOfMonths={2}
          />
          <div className="flex justify-end gap-2 p-3 border-t">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
              }}
            >
              Clear
            </Button>
            <Button 
              size="sm"
              onClick={() => {
                // Apply the current selection
                setIsOpen(false);
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
