
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { SystemLog } from '@/types/logs';

const SystemLogs: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { logs, isLoading, filters, setFilters, refetch } = useSystemLogsData();
  
  const handleViewLog = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };
  
  return (
    <div className="container py-6">
      <PageHeader
        title="System Logs"
        description="View and filter system events and activities"
      />
      
      <SystemLogFilters 
        filters={filters} 
        onFilterChange={setFilters} 
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
