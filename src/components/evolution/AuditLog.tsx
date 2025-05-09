
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuditLogFilters from './logs/AuditLogFilters';
import AuditLogTable from './logs/AuditLogTable';
import LogDetailDialog from './logs/LogDetailDialog';
import { AuditLog as AuditLogType, DateRange } from '@/types/shared';

interface AuditLogProps {
  logs: AuditLogType[];
  modules: string[];
  eventTypes: string[];
  isLoading: boolean;
  onRefresh: () => void;
}

const AuditLog: React.FC<AuditLogProps> = ({
  logs,
  modules,
  eventTypes,
  isLoading,
  onRefresh
}) => {
  const [module, setModule] = useState('all');
  const [eventType, setEventType] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleRefreshLogs = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  const handleViewDetails = (log: AuditLogType) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Audit Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <AuditLogFilters
          module={module}
          setModule={setModule}
          eventType={eventType}
          setEventType={setEventType}
          modules={modules}
          eventTypes={eventTypes}
          dateRange={dateRange}
          setDateRange={setDateRange}
          refresh={handleRefreshLogs}
          isLoading={isLoading}
        />
        
        <div className="mt-6">
          <AuditLogTable
            logs={logs}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
          />
        </div>
      </CardContent>

      <LogDetailDialog
        log={selectedLog} 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
      />
    </Card>
  );
};

export default AuditLog;
