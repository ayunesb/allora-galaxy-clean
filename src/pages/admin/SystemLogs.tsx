
import React from 'react';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';
import { useTenantId } from '@/hooks/useTenantId';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import SystemLogsTable from '@/components/admin/logs/SystemLogsTable';
import LogDetailDialog from '@/components/admin/logs/LogDetailDialog';
import { LogFilterState } from '@/components/admin/logs/SystemLogFilters';

const SystemLogs: React.FC = () => {
  const tenantId = useTenantId();
  const {
    logs,
    isLoading,
    moduleFilter,
    eventFilter,
    searchQuery,
    selectedDate,
    selectedLog,
    availableModules,
    availableEvents,
    resetFilters,
    handleFilterChange,
    handleViewDetails,
    closeLogDetails,
    handleRefresh
  } = useSystemLogsData(tenantId);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Logs</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <p className="text-muted-foreground mb-8">
        View detailed logs of all system activities and events.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>System Audit Log</CardTitle>
          <CardDescription>
            SOC2-style traceability for AI strategy evolution and execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <SystemLogFilters
              moduleFilter={moduleFilter}
              eventFilter={eventFilter}
              searchQuery={searchQuery}
              selectedDate={selectedDate}
              onReset={resetFilters}
              onFilterChange={(newFilters: LogFilterState) => handleFilterChange(newFilters)}
              modules={availableModules}
              events={availableEvents}
            />
          </div>
          
          <SystemLogsTable 
            logs={logs} 
            isLoading={isLoading} 
            onViewDetails={handleViewDetails}
            emptyMessage="No logs found matching your criteria."
          />
        </CardContent>
      </Card>
      
      <LogDetailDialog
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open: boolean) => !open && closeLogDetails()}
      />
    </div>
  );
};

export default withRoleCheck(SystemLogs, { roles: ['admin', 'owner'] });
