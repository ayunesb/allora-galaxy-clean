
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuditLogData } from '@/hooks/admin/useAuditLogData';
import { AuditLogFilters, type AuditLogFilterState } from '@/components/evolution/logs';
import { SystemLogsList } from '@/components/admin/logs';
import { AuditLog as AuditLogType, SystemLog } from '@/types/logs';
import { LogDetailDialog } from '@/components/evolution/logs';

interface AuditLogProps {
  className?: string;
}

export const AuditLog: React.FC<AuditLogProps> = ({ className }) => {
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilterState>({
    module: '',
    event: '',
    fromDate: null,
    toDate: null,
    searchTerm: ''
  });

  const { logs, isLoading, refetch } = useAuditLogData();

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
            isLoading={isLoading}
            onRefresh={refetch}
          />
          <Separator className="my-4" />
          <SystemLogsList
            logs={logs as unknown as SystemLog[]}
            isLoading={isLoading}
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
