
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { SystemLogFilterState } from '@/types/logs';
import { useLogModules, useLogEvents } from '@/services/logService';
import { useTenantId } from '@/hooks/useTenantId';

interface SystemLogFilterProps {
  filters: SystemLogFilterState;
  onFilterChange: (filters: SystemLogFilterState) => void;
  onReset: () => void;
}

const SystemLogFilter = ({ filters, onFilterChange, onReset }: SystemLogFilterProps) => {
  const { tenantId } = useTenantId();
  const { data: modules = [], isLoading: isLoadingModules } = useLogModules(tenantId);
  const { data: events = [], isLoading: isLoadingEvents } = useLogEvents(tenantId);
  const [filterState, setFilterState] = useState<SystemLogFilterState>(filters);
  
  const handleChange = (name: keyof SystemLogFilterState, value: any) => {
    setFilterState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleApplyFilters = () => {
    onFilterChange(filterState);
  };
  
  const handleResetFilters = () => {
    const defaultFilters = {
      module: '',
      event: '',
      searchTerm: '',
      fromDate: null,
      toDate: null
    };
    setFilterState(defaultFilters);
    onReset();
  };
  
  return (
    <div className="space-y-4 p-4 bg-muted/40 rounded-lg">
      <h3 className="text-lg font-medium">Filter Logs</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Module</label>
          <Select
            value={filterState.module}
            onValueChange={(value) => handleChange('module', value)}
            disabled={isLoadingModules}
          >
            <SelectTrigger>
              <SelectValue placeholder="All modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All modules</SelectItem>
              {modules.map((module) => (
                <SelectItem key={module} value={module}>{module}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Event</label>
          <Select
            value={filterState.event}
            onValueChange={(value) => handleChange('event', value)}
            disabled={isLoadingEvents}
          >
            <SelectTrigger>
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event} value={event}>{event}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <Input
            placeholder="Search logs..."
            value={filterState.searchTerm}
            onChange={(e) => handleChange('searchTerm', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">From Date</label>
          <DatePicker
            date={filterState.fromDate}
            onDateChange={(date) => handleChange('fromDate', date)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">To Date</label>
          <DatePicker
            date={filterState.toDate}
            onDateChange={(date) => handleChange('toDate', date)}
          />
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button variant="default" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
        <Button variant="outline" onClick={handleResetFilters}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default SystemLogFilter;
