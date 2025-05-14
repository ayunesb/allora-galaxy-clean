
import React, { useState } from 'react';
import PageHelmet from '@/components/PageHelmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemLogsData, SystemLog } from '@/hooks/admin/useSystemLogsData';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';

const SystemLogsPage: React.FC = () => {
  const { 
    logs, 
    loading, 
    filters, 
    updateFilters, 
    refresh, 
    availableModules 
  } = useSystemLogsData({ searchTerm: '' });
  
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewLog = (log: SystemLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  return (
    <>
      <PageHelmet 
        title="System Logs" 
        description="View system logs and events" 
      />
      
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">System Logs</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>System Event Logs</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <SystemLogFilters 
                filters={filters}
                onFilterChange={updateFilters}
                availableModules={availableModules}
                onRefresh={refresh}
                isLoading={loading}
              />
            </div>
            
            <SystemLogsList 
              logs={logs} 
              isLoading={loading}
              onViewLog={handleViewLog}
            />
          </CardContent>
        </Card>
      </div>
      
      <LogDetailDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        log={selectedLog}
      />
    </>
  );
};

export default SystemLogsPage;
