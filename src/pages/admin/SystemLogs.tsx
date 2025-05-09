import React, { useState, useCallback } from 'react';
import PageHelmet from '@/components/PageHelmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';

const SystemLogs: React.FC = () => {
  const [level, setLevel] = useState('all');
  const [module, setModule] = useState('all');
  const {
    logs,
    modules,
    isLoading,
    fetchLogs,
  } = useSystemLogsData();

  const handleRefresh = useCallback(() => {
    fetchLogs({ level: level === 'all' ? undefined : level, module: module === 'all' ? undefined : module });
  }, [fetchLogs, level, module]);

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
            refresh={handleRefresh}
            modules={modules}
            isLoading={isLoading}
          />
          
          {/* Log table will go here - implement as needed */}
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
              <pre className="bg-muted p-4 rounded max-h-96 overflow-auto text-xs">
                {JSON.stringify(logs, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogs;
