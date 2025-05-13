
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuditLogData } from '@/hooks/admin/useAuditLogData';
import { AuditLogFilters } from '@/components/evolution/logs';
import { SystemLogsList } from '@/components/admin/logs';
import { AuditLog as AuditLogType, SystemLog } from '@/types/logs';
import { LogDetailDialog } from '@/components/evolution/logs';
import { AuditLogFilterState } from '@/components/evolution/logs/types';
import { auditLogToSystemLog, systemLogToAuditLog } from '@/lib/utils/logTransformations';

interface AuditLogProps {
  className?: string;
  data?: AuditLogType[];
  isLoading?: boolean;
  onRefresh?: () => void;
  title?: string;
}

export const AuditLog: React.FC<AuditLogProps> = ({ 
  className,
  data,
  isLoading,
  onRefresh,
  title = "Audit Logs" 
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

  const handleViewLog = (log: SystemLog) => {
    // Since we're displaying SystemLogs but tracking AuditLogs
    // Find the matching audit log from our data
    const auditLog = displayLogs?.find(aLog => aLog.id === log.id);
    setSelectedLog(auditLog || systemLogToAuditLog(log));
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
          <CardTitle>{title}</CardTitle>
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
            logs={displayLogs?.map(auditLogToSystemLog) || []}
            isLoading={loading}
            onViewLog={handleViewLog}
          />
        </CardContent>
      </Card>

      <LogDetailDialog
        log={selectedLog}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default AuditLog;
