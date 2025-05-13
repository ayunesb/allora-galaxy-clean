
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuditLogData } from '@/hooks/admin/useAuditLogData';
import { AuditLogFilters, type AuditLogFilterState } from '@/components/evolution/logs';
import { SystemLogsList } from '@/components/admin/logs';
import { AuditLog as AuditLogType, SystemLog } from '@/types/logs';
import { LogDetailDialog } from '@/components/evolution/logs';

interface AuditLogProps {
  className?: string;
  data?: AuditLogType[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const AuditLog: React.FC<AuditLogProps> = ({ 
  className,
  data,
  isLoading,
  onRefresh
}) => {
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilterState>({
    module: '',
    event: '',
    fromDate: null,
    toDate: null,
    searchTerm: ''
  });

  const { logs, isLoading: fetchingLogs, refetch } = useAuditLogData();

  // Use provided data or fetched logs
  const displayLogs = data || logs;
  const loading = isLoading !== undefined ? isLoading : fetchingLogs;
  const refreshData = onRefresh || refetch;

  const handleViewLog = (log: AuditLogType) => {
    setSelectedLog(log as unknown as AuditLogType);
    setDialogOpen(true);
  };

  const handleFilterChange = (newFilters: AuditLogFilterState) => {
    setFilters(newFilters);
    // Apply filters logic would go here
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            isLoading={loading}
            onRefresh={refreshData}
          />
          <Separator className="my-4" />
          <SystemLogsList
            logs={displayLogs as unknown as SystemLog[]}
            isLoading={loading}
            onViewLog={handleViewLog}
          />
        </CardContent>
      </Card>

      <LogDetailDialog
        log={selectedLog as unknown as SystemLog}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default AuditLog;
