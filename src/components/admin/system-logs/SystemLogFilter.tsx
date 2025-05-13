
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LogFilters } from '@/types/logs';
import { DateRange } from 'react-day-picker';

interface SystemLogFilterProps {
  onChange: (filters: LogFilters) => void;
  initialFilters?: LogFilters;
  className?: string;
}

const SystemLogFilter: React.FC<SystemLogFilterProps> = ({
  onChange,
  initialFilters = {},
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
  const [module, setModule] = useState(initialFilters.module || '');
  const [event, setEvent] = useState(initialFilters.event || '');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialFilters.fromDate || initialFilters.toDate
      ? { from: initialFilters.fromDate || undefined, to: initialFilters.toDate || undefined }
      : undefined
  );

  // Fetch modules
  const { data: modules = [] } = useQuery({
    queryKey: ['logModules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('module')
        .order('module');
      if (error) throw error;
      
      // Extract and deduplicate module values
      const moduleValues = data.map((item: { module: string }) => item.module);
      return Array.from(new Set(moduleValues)).filter(Boolean);
    }
  });

  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ['logEvents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('event')
        .order('event');
      if (error) throw error;
      
      // Extract and deduplicate event values
      const eventValues = data.map((item: { event: string }) => item.event);
      return Array.from(new Set(eventValues)).filter(Boolean);
    }
  });

  const handleSearch = () => {
    onChange({
      searchTerm,
      module,
      event,
      fromDate: dateRange?.from || null,
      toDate: dateRange?.to || null,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setModule('');
    setEvent('');
    setDateRange(undefined);
    onChange({});
  };

  const handleModuleChange = (value: string) => {
    setModule(value);
  };

  const handleEventChange = (value: string) => {
    setEvent(value);
  };

  return (
    <Card className={`p-4 space-y-4 ${className}`}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Select value={module} onValueChange={handleModuleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Modules</SelectItem>
              {modules.map((mod: string) => (
                <SelectItem key={mod} value={mod}>
                  {mod}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={event} onValueChange={handleEventChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Events</SelectItem>
              {events.map((evt: string) => (
                <SelectItem key={evt} value={evt}>
                  {evt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
          align="start"
        />

        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSearch}>Apply Filters</Button>
        </div>
      </div>
    </Card>
  );
};

export default SystemLogFilter;
