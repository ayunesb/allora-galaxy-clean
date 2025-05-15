
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange as DateRangeType } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DateRangePickerProps {
  selected?: { from?: Date; to?: Date };
  onSelect: (range: { from: Date; to: Date }) => void;
  disabled?: boolean;
  className?: string;
}

export function DateRange({
  selected,
  onSelect,
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRangeType | undefined>(selected);

  const handleSelect = (range: DateRangeType | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      onSelect(range);
    }
  };

  const formatDate = (date?: Date) => {
    return date ? format(date, "MMM dd, yyyy") : "";
  };

  const dateDisplay = date?.from
    ? date.to
      ? `${formatDate(date.from)} - ${formatDate(date.to)}`
      : formatDate(date.from)
    : "Select date range";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start text-left",
            !date?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateDisplay}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          numberOfMonths={2}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
