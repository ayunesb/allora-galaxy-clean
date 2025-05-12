
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AuditLog as AuditLogType, SystemLog, LogEntry, isSystemLog, getContextPreview } from '@/types/logs';
import LogDetailDialog from './logs/LogDetailDialog';

interface AuditLogProps {
  title?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  data: LogEntry[];
}

const AuditLog = ({ title = "Audit Log", isLoading, onRefresh, data }: AuditLogProps) => {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Format timestamp
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const handleLogClick = (log: LogEntry) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedLog(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No logs found.</p>
        ) : (
          <div className="space-y-4">
            {data.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleLogClick(log)}
              >
                <div className="space-y-1">
                  <div className="font-medium flex flex-col sm:flex-row gap-2 sm:items-center">
                    <span>{isSystemLog(log) ? log.event : log.event_type}</span>
                    {(isSystemLog(log) && log.module) && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {log.module}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isSystemLog(log) 
                      ? log.description || getContextPreview(log.context) 
                      : log.description || getContextPreview(log.metadata)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 sm:mt-0">
                  {formatDate(log.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}

        <LogDetailDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          log={selectedLog}
        />
      </CardContent>
    </Card>
  );
};

export default AuditLog;
