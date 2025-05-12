
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import SystemLogFilters, { SystemLogFilterState } from '@/components/admin/logs/SystemLogFilters';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { SystemLog, LogFilters, SystemEventType } from '@/types/logs';

const SystemLogs: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { logs, isLoading, filters, setFilters, refetch } = useSystemLogsData();
  
  const handleViewLog = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };
  
  const handleFilterChange = (newFilters: SystemLogFilterState) => {
    // Convert SystemLogFilterState to LogFilters
    // Handle empty string for module by converting to null
    const updatedFilters: LogFilters = {
      ...newFilters,
      module: newFilters.module === '' ? null : newFilters.module,
      event: newFilters.event === '' ? null : newFilters.event as SystemEventType | null
    };
    
    setFilters(updatedFilters);
  };
  
  return (
    <div className="container py-6">
      <PageHeader
        title="System Logs"
        description="View and filter system events and activities"
      />
      
      <SystemLogFilters 
        filters={filters as SystemLogFilterState} 
        onFilterChange={handleFilterChange} 
        isLoading={isLoading}
        onRefresh={refetch}
      />
      
      <Card className="mt-6">
        <CardContent className="p-0 sm:p-6">
          <SystemLogsList 
            logs={logs} 
            isLoading={isLoading} 
            onViewLog={handleViewLog}
          />
        </CardContent>
      </Card>
      
      <LogDetailDialog 
        log={selectedLog} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </div>
  );
};

export default SystemLogs;
