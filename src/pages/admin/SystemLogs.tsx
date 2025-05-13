
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { SystemLog } from '@/types/logs';
import { SystemLogFilters, SystemLogsList, LogDetailDialog } from '@/components/admin/logs';
import AdminLayout from '@/components/layout/AdminLayout';
import { SystemLogFilterState } from '@/types/logs';

const SystemLogs: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { 
    logs, 
    modules, 
    events, 
    isLoading, 
    error, 
    filters, 
    setFilters, 
    refetch 
  } = useSystemLogsData();
  
  const handleViewLog = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };
  
  const handleFilterChange = (newFilters: SystemLogFilterState) => {
    setFilters(newFilters);
  };
  
  return (
    <AdminLayout>
      <div className="container py-6">
        <PageHeader
          title="System Logs"
          description="View and monitor system events and activity"
        />
        
        <div className="mb-6">
          <SystemLogFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
            onRefresh={refetch}
            modules={modules}
            events={events}
          />
        </div>
        
        <Card className="mt-6">
          <CardContent className="p-0 sm:p-6">
            <SystemLogsList 
              logs={logs} 
              isLoading={isLoading} 
              onViewLog={handleViewLog}
            />
            
            {error && (
              <p className="text-red-500 p-4">
                Error loading logs: {error}
              </p>
            )}
          </CardContent>
        </Card>
        
        <LogDetailDialog 
          log={selectedLog} 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
        />
      </div>
    </AdminLayout>
  );
};

export default SystemLogs;
