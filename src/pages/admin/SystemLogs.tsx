
import React, { useState, useEffect } from 'react';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import SystemLogsTable, { SystemLog } from '@/components/admin/logs/SystemLogsTable';
import LogDetailDialog from '@/components/admin/logs/LogDetailDialog';

interface LogFilterState {
  moduleFilter: string;
  eventFilter: string;
  searchQuery: string;
  selectedDate: Date | null;
}

const SystemLogs: React.FC = () => {
  const { logs, loading, error } = useSystemLogsData();
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  
  const [filters, setFilters] = useState<LogFilterState>({
    moduleFilter: '',
    eventFilter: '',
    searchQuery: '',
    selectedDate: null
  });

  useEffect(() => {
    // Extract unique modules and events for filters
    if (logs?.length) {
      const uniqueModules = [...new Set(logs.map(log => log.module))];
      const uniqueEvents = [...new Set(logs.map(log => log.event_type))];
      setModules(uniqueModules);
      setEvents(uniqueEvents);
    }
    
    // Apply filters
    let filtered = [...(logs || [])];
    
    if (filters.moduleFilter) {
      filtered = filtered.filter(log => log.module === filters.moduleFilter);
    }
    
    if (filters.eventFilter) {
      filtered = filtered.filter(log => log.event_type === filters.eventFilter);
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(query) || 
        log.module.toLowerCase().includes(query) || 
        log.event_type.toLowerCase().includes(query)
      );
    }
    
    if (filters.selectedDate) {
      const selectedDate = filters.selectedDate.toDateString();
      filtered = filtered.filter(log => {
        const logDate = new Date(log.created_at).toDateString();
        return logDate === selectedDate;
      });
    }
    
    setFilteredLogs(filtered);
  }, [logs, filters]);

  const handleFilterChange = (newFilters: LogFilterState) => {
    setFilters(newFilters);
  };
  
  const handleResetFilters = () => {
    setFilters({
      moduleFilter: '',
      eventFilter: '',
      searchQuery: '',
      selectedDate: null
    });
  };
  
  const handleViewDetails = (log: SystemLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <SystemLogFilters
            onReset={handleResetFilters}
            onFilterChange={handleFilterChange}
            modules={modules}
            events={events}
          />
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <SystemLogsTable logs={filteredLogs} onViewDetails={handleViewDetails} />
          )}
          
          <LogDetailDialog
            log={selectedLog}
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default withRoleCheck(SystemLogs, { roles: ['admin', 'owner'] });
