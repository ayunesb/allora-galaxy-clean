
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
  const [filters, setFilters] = useState({
    moduleFilter: '',
    eventFilter: '',
    searchQuery: '',
    selectedDate: null as DateRange | null
  });

  // Extract unique modules and event types from data
  const modules = Array.from(new Set(data.map(log => log.module)));
  const events = Array.from(new Set(data.map(log => log.event_type)));

  // Filter logs based on selected filters
  const filteredLogs = data.filter(log => {
    const matchesModule = !filters.moduleFilter || log.module === filters.moduleFilter;
    const matchesEvent = !filters.eventFilter || log.event_type === filters.eventFilter;
    const matchesSearch = !filters.searchQuery || 
      log.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      log.event_type.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    // Date filtering logic would go here if needed
    
    return matchesModule && matchesEvent && matchesSearch;
  });

  const handleFilterChange = useCallback((type: string, value: string | DateRange | null) => {
    setFilters(prev => ({
      ...prev,
      [type === 'search' ? 'searchQuery' : 
        type === 'module' ? 'moduleFilter' :
        type === 'event' ? 'eventFilter' : 
        'selectedDate']: value
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      moduleFilter: '',
      eventFilter: '',
      searchQuery: '',
      selectedDate: null
    });
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
            filters={filters}
            modules={modules}
            events={events}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onRefresh={onRefresh}
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
