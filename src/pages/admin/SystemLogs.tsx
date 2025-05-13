
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { SystemLog } from '@/types/logs';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import AdminLayout from '@/components/layout/AdminLayout';

const SystemLogs: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { logs, isLoading, error, refetch } = useSystemLogsData();
  
  const handleViewLog = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };
  
  return (
    <AdminLayout>
      <div className="container py-6">
        <PageHeader
          title="System Logs"
          description="View and monitor system events and activity"
        />
        
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
