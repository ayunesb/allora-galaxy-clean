
import { useState, useCallback } from 'react';
import PageHelmet from '@/components/PageHelmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { AuditLog, DateRange } from '@/types/shared';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import AuditLogTable, { AuditLog as TableAuditLog } from '@/components/evolution/logs/AuditLogTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define SystemLog type
export interface SystemLog {
  id: string;
  module: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  event: string; // Using event instead of type for consistency
  description: string;
  context: any;
  tenant_id: string;
  created_at: string;
}

const SystemLogs: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

  const {
    logs,
    modules,
    events,
    isLoading,
    handleRefresh,
    moduleFilter,
    eventFilter,
    searchQuery,
    selectedDate,
    handleFilterChange,
    handleResetFilters
  } = useSystemLogsData();

  const handleRefreshLogs = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleViewDetails = (log: SystemLog) => {
    // Convert SystemLog to AuditLog format
    const auditLog: AuditLog = {
      id: log.id,
      module: log.module,
      event_type: log.event || 'system_event',
      description: log.description || 'No description',
      tenant_id: log.tenant_id,
      metadata: log.context,
      created_at: log.created_at,
    };
    setSelectedLog(auditLog);
    setDetailsOpen(true);
  };

  // Convert SystemLogs to AuditLogs format for the table component
  const convertedLogs: TableAuditLog[] = logs.map(log => ({
    id: log.id,
    module: log.module,
    event_type: log.event || 'system_event',
    description: log.description || 'No description',
    tenant_id: log.tenant_id,
    metadata: log.context,
    created_at: log.created_at,
  }));

  // Create a handler for table log view
  const handleTableLogView = (log: TableAuditLog) => {
    // Find the original log
    const originalLog = logs.find(l => l.id === log.id);
    
    if (originalLog) {
      handleViewDetails(originalLog);
    }
  };

  // Function to adapt handler for SystemLogFilters
  const handleLogFilterChange = (type: string, value: string | DateRange | null) => {
    handleFilterChange(type, value as string | DateRange | null);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <PageHelmet
        title="System Logs"
        description="View and manage system logs"
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <SystemLogFilters
            moduleFilter={moduleFilter}
            eventFilter={eventFilter}
            searchQuery={searchQuery}
            selectedDate={selectedDate as DateRange | null}
            modules={modules}
            events={events}
            handleFilterChange={handleLogFilterChange}
            handleResetFilters={handleResetFilters}
            handleRefresh={handleRefreshLogs}
            isLoading={isLoading}
          />
          
          <div className="mt-6">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'json')} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="json">JSON View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="table" className="m-0">
                <AuditLogTable 
                  logs={convertedLogs} 
                  isLoading={isLoading} 
                  onViewDetails={handleTableLogView}
                />
              </TabsContent>
              
              <TabsContent value="json" className="m-0">
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No logs matching your filters
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded overflow-auto max-h-96">
                    <pre className="text-xs">
                      {JSON.stringify(logs, null, 2)}
                    </pre>
                    <div className="flex justify-end mt-4">
                      {logs.map((log, idx) => (
                        <button 
                          key={log.id || idx}
                          className="text-xs text-primary hover:underline mr-2" 
                          onClick={() => handleViewDetails(log)}
                        >
                          View Details #{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <LogDetailDialog 
        log={selectedLog} 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
      />
    </div>
  );
};

export default SystemLogs;
