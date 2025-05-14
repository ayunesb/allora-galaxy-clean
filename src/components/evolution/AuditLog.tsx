
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import { AuditLog } from '@/types/logs';
import AuditLogFilters, { AuditLogFilter } from '@/components/evolution/logs/AuditLogFilters';
import { SystemEventModule } from '@/types/shared';

interface AuditLogComponentProps {
  logs: AuditLog[];
  isLoading: boolean;
  filters: AuditLogFilter;
  setFilters: (filters: AuditLogFilter) => void;
  onRefresh: () => void;
  title?: string;
  pagination?: React.ReactNode;
}

export const AuditLogComponent: React.FC<AuditLogComponentProps> = ({
  logs,
  isLoading,
  filters,
  setFilters,
  onRefresh,
  title = "Audit Log",
  pagination
}) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const viewLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const closeLogDetails = () => {
    setDetailModalOpen(false);
  };

  // Get badge variant based on event type
  const getBadgeVariant = (event: string) => {
    event = event.toLowerCase();
    if (event.includes('error') || event.includes('fail') || event.includes('reject')) return 'destructive';
    if (event.includes('warn')) return 'warning';
    if (event.includes('success') || event.includes('create') || event.includes('approve')) return 'success';
    return 'secondary';
  };

  // Available modules for filtering
  const moduleOptions: SystemEventModule[] = [
    'strategy',
    'plugin',
    'agent',
    'auth',
    'system',
    'tenant',
    'user',
    'kpi',
    'execution'
  ];

  return (
    <div className="space-y-4">
      <AuditLogFilters
        filters={filters}
        setFilters={setFilters}
        onRefresh={onRefresh}
        isLoading={isLoading}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium">Event</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Module</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Timestamp</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4"><Skeleton className="h-6 w-32" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-36" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-48" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      No logs found matching your filters
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                      onClick={() => viewLogDetails(log)}
                    >
                      <td className="p-4">
                        <Badge variant={getBadgeVariant(log.event)}>
                          {log.event}
                        </Badge>
                      </td>
                      <td className="p-4">{log.module}</td>
                      <td className="p-4">
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                      </td>
                      <td className="p-4 max-w-md truncate">
                        {log.context ? (
                          <pre className="text-xs whitespace-pre-wrap">
                            {JSON.stringify(log.context, null, 2).substring(0, 100)}
                            {JSON.stringify(log.context, null, 2).length > 100 ? '...' : ''}
                          </pre>
                        ) : (
                          <span className="text-muted-foreground italic">No details</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {pagination && (
            <div className="px-4 py-2 border-t">
              {pagination}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedLog && (
        <LogDetailDialog
          log={selectedLog}
          open={detailModalOpen}
          onClose={closeLogDetails}
        />
      )}
    </div>
  );
};

export default AuditLogComponent;
