
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DateRangePickerProps = {
  date?: DateRange;
  onDateChange: (date: DateRange) => void;
  align?: "center" | "start" | "end";
  locale?: Locale;
  showCompare?: boolean;
};

export function DateRangePicker({
  date,
  onDateChange,
  align = "center",
  locale,
  showCompare,
}: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<string | undefined>();

  const presets = [
    {
      name: "Today",
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
    },
    {
      name: "Yesterday",
      dateRange: {
        from: addDays(new Date(), -1),
        to: addDays(new Date(), -1),
      },
    },
    {
      name: "Last 7 days",
      dateRange: {
        from: addDays(new Date(), -7),
        to: new Date(),
      },
    },
    {
      name: "Last 30 days",
      dateRange: {
        from: addDays(new Date(), -30),
        to: new Date(),
      },
    },
    {
      name: "Last 90 days",
      dateRange: {
        from: addDays(new Date(), -90),
        to: new Date(),
      },
    },
  ];

  const handleSelect = (preset: { name: string; dateRange: DateRange }) => {
    setSelectedPreset(preset.name);
    onDateChange(preset.dateRange);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date-range"
          variant="outline"
          className={cn(
            "w-full justify-start text-left",
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
            <span>Select date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 p-3">
          <div>
            <Select
              value={selectedPreset}
              onValueChange={(value) => {
                const preset = presets.find((preset) => preset.name === value);
                if (preset) handleSelect(preset);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={(range) => {
                if (range) {
                  setSelectedPreset(undefined);
                  onDateChange(range);
                }
              }}
              numberOfMonths={2}
              locale={locale}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
