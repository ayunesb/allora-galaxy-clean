
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import LogDetailDialog from '@/components/admin/logs/LogDetailDialog';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import { useSystemLogsData } from '@/hooks/useSystemLogsData';
import { SystemLog, LogFilters } from '@/types/logs';
import AdminLayout from '@/components/layout/AdminLayout';
import { ErrorBoundary } from '@/components/errors';

/**
 * SystemLogs - Admin page for viewing and filtering system logs
 */
const SystemLogs: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { logs, isLoading, filters, updateFilters, refetch } = useSystemLogsData();
  
  const handleViewLog = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };
  
  const handleFilterChange = (newFilters: LogFilters) => {
    updateFilters(newFilters);
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="System Logs"
          description="View and filter system events and activities"
        />
        
        <ErrorBoundary>
          <SystemLogFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            isLoading={isLoading}
            onRefresh={refetch}
          />
          
          <Card>
            <CardContent className="p-0 sm:p-0">
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
        </ErrorBoundary>
      </div>
    </AdminLayout>
  );
};

export default SystemLogs;
