
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
  onChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (range: { from: Date; to?: Date }) => {
    onChange?.(range);
    if (range.to) {
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "LLL dd, y")} -{" "}
                {format(value.to, "LLL dd, y")}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-6 w-6 px-0"
                  onClick={handleClear}
                >
                  ×
                </Button>
              </>
            ) : (
              format(value.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
