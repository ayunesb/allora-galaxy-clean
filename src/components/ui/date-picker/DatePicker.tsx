
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
import type { SelectSingleEventHandler } from "react-day-picker";

export interface DatePickerProps {
  date: Date | null;
  onSelect?: (date: Date | null) => void;
  onDateChange?: (date: Date | null) => void; // Alternative prop name for compatibility
  placeholder?: string; // Added placeholder prop
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  date, 
  onSelect,
  onDateChange,
  placeholder = "Pick a date" 
}) => {
  // Handle date changes through either prop
  const handleDateChange: SelectSingleEventHandler = (selectedDate) => {
    const newDate = selectedDate || null;
    if (onSelect) onSelect(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={handleDateChange}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
