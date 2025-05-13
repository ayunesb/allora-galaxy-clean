
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { type SelectSingleEventHandler } from "react-day-picker";

interface DatePickerProps {
  date: Date | null;
  onDateChange: (date: Date | null) => void;
}

export function DatePicker({ date, onDateChange }: DatePickerProps) {
  // Create a handler compatible with SelectSingleEventHandler
  const handleSelect: SelectSingleEventHandler = (day) => {
    onDateChange(day || null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
