
import React, { useState, useEffect } from 'react';
import { useAuditLogData, AuditLogFilter } from '@/hooks/admin/useAuditLogData';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from '@/types/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SystemEventModule, LogSeverity } from '@/types/shared';

interface AuditLogTableProps {
  moduleFilter?: SystemEventModule;
  limit?: number;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  moduleFilter,
  limit = 100
}) => {
  const [filters, setFilters] = useState<AuditLogFilter>({
    searchTerm: '',
    module: moduleFilter,
  });
  
  // Convert to useAuditLogData props format
  const initialFilters = moduleFilter ? { module: moduleFilter } : {};
  
  const { 
    logs, 
    isLoading, 
    modules,
    handleRefresh,
    handleFilterChange
  } = useAuditLogData({ 
    initialFilters 
  });

  useEffect(() => {
    // Update filters when moduleFilter prop changes
    if (moduleFilter) {
      setFilters(prev => ({ ...prev, module: moduleFilter }));
      handleFilterChange({ ...filters, module: moduleFilter });
    }
  }, [moduleFilter]);

  const handleSearch = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
    handleFilterChange({ ...filters, searchTerm: term });
  };

  const handleModuleChange = (value: string) => {
    const moduleValue = value === 'all' ? undefined : value as SystemEventModule;
    setFilters(prev => ({ ...prev, module: moduleValue }));
    handleFilterChange({ ...filters, module: moduleValue });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
    handleFilterChange({ ...filters, dateRange: range });
  };

  // Helper function to format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (e) {
      return dateString;
    }
  };

  // Get color for severity level
  const getSeverityColor = (severity: string): string => {
    switch (severity?.toLowerCase()) {
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'info':
        return 'bg-info text-info-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search logs..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          
          <Select 
            value={filters.module || 'all'} 
            onValueChange={handleModuleChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {modules.map(module => (
                <SelectItem key={module} value={module}>{module}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal w-[190px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd")} - {format(filters.dateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd")
                  )
                ) : (
                  <span>Date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={filters.dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No logs found matching the current filters
                </TableCell>
              </TableRow>
            ) : (
              logs.slice(0, limit).map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.module}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(getSeverityColor(log.severity))}>
                      {log.event}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {log.context?.description || JSON.stringify(log.context)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
