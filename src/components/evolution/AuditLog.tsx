
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuditLogData } from '@/hooks/admin/useAuditLogData';
import AuditLogFilters, { AuditLogFilterState } from './logs/AuditLogFilters';
import AuditLogTable from './logs/AuditLogTable';
import LogDetailDialog from './logs/LogDetailDialog';

export const AuditLog: React.FC = () => {
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
  } = useAuditLogData();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Audit Log</span>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>System and AI decision trail</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <AuditLogFilters
            moduleFilter={moduleFilter}
            eventFilter={eventFilter}
            searchQuery={searchQuery}
            selectedDate={selectedDate}
            onReset={resetFilters}
            onFilterChange={(newFilters: AuditLogFilterState) => handleFilterChange(newFilters)}
            modules={availableModules}
            events={availableEvents}
          />
        </div>
        
        <AuditLogTable 
          logs={logs} 
          isLoading={isLoading} 
          onViewDetails={handleViewDetails}
          emptyMessage="No logs found matching your criteria."
        />
        
        <LogDetailDialog
          log={selectedLog}
          open={!!selectedLog}
          onOpenChange={(open: boolean) => !open && closeLogDetails()}
        />
      </CardContent>
    </Card>
  );
};

export default AuditLog;
