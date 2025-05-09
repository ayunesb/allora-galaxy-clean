
import React, { useState, useCallback } from 'react';
import PageHelmet from '@/components/PageHelmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';

// Define SystemLog type
export interface SystemLog {
  id: string;
  module: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  type: string;
  description: string;
  metadata: any;
  tenant_id: string;
  created_at: string;
}

const SystemLogs: React.FC = () => {
  const [level, setLevel] = useState('all');
  const [module, setModule] = useState('all');
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const {
    logs,
    modules,
    isLoading,
    handleRefresh,
  } = useSystemLogsData();

  const handleRefreshLogs = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleViewDetails = (log: SystemLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
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
            level={level}
            setLevel={setLevel}
            module={module}
            setModule={setModule}
            refresh={handleRefreshLogs}
            modules={modules}
            isLoading={isLoading}
          />
          
          <div className="mt-6">
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
