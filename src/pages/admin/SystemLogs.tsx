
import React, { useState } from 'react';
import PageHelmet from '@/components/PageHelmet';
import { Card, CardContent } from '@/components/ui/card';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { SystemLogFilters } from '@/components/admin/logs/SystemLogFilters';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import { SystemLogFilter } from '@/types/shared';
import LogDetailDialog from '@/components/admin/logs/LogDetailDialog';
import { LogsPagination } from '@/components/admin/logs/LogsPagination';
import { SystemLog } from '@/types/logs';

const SystemLogs: React.FC = () => {
  const [filter, setFilter] = useState<SystemLogFilter>({
    searchTerm: '',
  });
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { 
    data, 
    isLoading, 
    refresh, 
    modules, 
    events,
    severities, 
    currentPage,
    totalPages,
    goToPage,
    exportToCsv
  } = useSystemLogsData({
    initialFilter: filter,
    pageSize: 25
  });

  const handleViewLogDetails = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const handleFilterChange = (newFilter: SystemLogFilter) => {
    setFilter(newFilter);
  };

  const handleExport = () => {
    exportToCsv();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet title="System Logs" description="Review system event logs" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Logs</h1>
          <p className="text-muted-foreground">Monitor and analyze system activity</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <SystemLogFilters
            filter={filter}
            setFilter={handleFilterChange}
            modules={modules}
            events={events}
            severities={severities}
            onRefresh={refresh}
            isLoading={isLoading}
            className="mb-6"
          />
          
          <SystemLogsList
            logs={data}
            isLoading={isLoading}
            title="System Event Logs"
            onViewDetails={handleViewLogDetails}
            onExport={handleExport}
          />
          
          {totalPages > 1 && (
            <div className="mt-6">
              <LogsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <LogDetailDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        log={selectedLog}
      />
    </div>
  );
};

export default SystemLogs;
