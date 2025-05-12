
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import { useAdminLogs } from '@/hooks/admin/useAdminLogs';
import { AuditLog } from '@/types/logs';

const SystemLogs = () => {
  const { logs, isLoading, filters, setFilters, refetchLogs } = useAdminLogs();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const handleLogClick = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Logs</h1>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Log Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemLogFilters 
              filters={filters}
              onFiltersChange={setFilters}
              isLoading={isLoading}
              onRefresh={refetchLogs}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Events</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemLogsList 
              logs={logs} 
              isLoading={isLoading}
              onLogClick={handleLogClick}
            />
          </CardContent>
        </Card>
      </div>
      
      <LogDetailDialog 
        log={selectedLog} 
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
};

export default SystemLogs;
