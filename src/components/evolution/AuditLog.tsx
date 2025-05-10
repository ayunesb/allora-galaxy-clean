
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditLog as AuditLogType, DateRange } from '@/types/shared';
import AuditLogTable from './logs/AuditLogTable';
import AuditLogFilters from './logs/AuditLogFilters';
import LogDetailDialog from './logs/LogDetailDialog';

interface AuditLogProps {
  title?: string;
  data: AuditLogType[];
  isLoading: boolean;
  onRefresh: () => void;
}

const AuditLog: React.FC<AuditLogProps> = ({
  title = "Audit Logs",
  data,
  isLoading,
  onRefresh
}) => {
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [moduleFilter, setModuleFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  // Extract unique modules and event types from data
  const modules = Array.from(new Set(data.map(log => log.module)));
  const events = Array.from(new Set(data.map(log => log.event_type)));

  // Filter logs based on selected filters
  const filteredLogs = data.filter(log => {
    const matchesModule = !moduleFilter || log.module === moduleFilter;
    const matchesEvent = !eventFilter || log.event_type === eventFilter;
    const matchesSearch = !searchQuery || 
      log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.event_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Date filtering logic would go here if needed
    
    return matchesModule && matchesEvent && matchesSearch;
  });

  const handleFilterChange = useCallback((type: string, value: string | DateRange | null) => {
    switch (type) {
      case 'module':
        setModuleFilter(value as string);
        break;
      case 'event':
        setEventFilter(value as string);
        break;
      case 'search':
        setSearchQuery(value as string);
        break;
      case 'date':
        setDateRange(value as DateRange | null);
        break;
      default:
        break;
    }
  }, []);

  const handleResetFilters = useCallback(() => {
    setModuleFilter('');
    setEventFilter('');
    setSearchQuery('');
    setDateRange(null);
  }, []);

  const handleViewDetails = useCallback((log: AuditLogType) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuditLogFilters
            moduleFilter={moduleFilter}
            eventFilter={eventFilter}
            searchQuery={searchQuery}
            selectedDate={dateRange}
            modules={modules}
            events={events}
            handleFilterChange={handleFilterChange}
            handleResetFilters={handleResetFilters}
            handleRefresh={onRefresh}
            isLoading={isLoading}
          />
          
          <AuditLogTable
            logs={filteredLogs}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      <LogDetailDialog
        log={selectedLog}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
};

export default AuditLog;
