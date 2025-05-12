
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DownloadIcon, FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import SystemLogFilters, { SystemLogFilter } from '@/components/admin/logs/SystemLogFilters';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import { fetchSystemLogs, fetchLogModules, fetchTenants } from '@/lib/admin/systemLogs';
import { getSystemLogColumns } from '@/lib/admin/systemLogColumns';
import { SystemLog } from '@/types';

const SystemLogs: React.FC = () => {
  const [filters, setFilters] = useState<SystemLogFilter>({});
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(true);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['system-logs', filters],
    queryFn: () => fetchSystemLogs(filters),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['log-modules'],
    queryFn: fetchLogModules,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: fetchTenants,
  });

  const handleRowClick = (log: SystemLog) => {
    setSelectedLog(log);
  };

  const columns = getSystemLogColumns(handleRowClick);

  const exportLogs = () => {
    if (!logs) return;
    
    const csvContent = [
      // CSV Header
      ['ID', 'Module', 'Event', 'Timestamp', 'Context'].join(','),
      
      // CSV Rows
      ...logs.map(log => [
        log.id,
        log.module,
        log.event,
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.context ? JSON.stringify(log.context) : ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `system-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="System Logs"
        description="View and filter system logs"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
              <FilterIcon className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              disabled={!logs || logs.length === 0}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      {isFilterVisible && (
        <SystemLogFilters 
          filters={filters}
          onFilterChange={setFilters}
          modules={modules}
          tenants={tenants}
        />
      )}

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={logs || []}
            isLoading={isLoading}
            noDataText="No system logs found"
            pagination
          />
        </CardContent>
      </Card>

      <LogDetailDialog
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
};

export default SystemLogs;
