
import * as React from 'react';
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

export interface DatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  popoverWidth?: boolean;
}

export function DatePicker({
  date,
  onSelect,
  disabled = false,
  placeholder = "Pick a date",
  className,
  popoverWidth = true,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={popoverWidth ? "w-auto" : ""} align="start">
        <Calendar
          mode="single"
          selected={date || null}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
