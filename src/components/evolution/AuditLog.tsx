
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import LogDetailDialog from './logs/LogDetailDialog';

interface AuditLogProps {
  title?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  data: any[]; // Use any for flexibility since we handle type checking internally
}

const AuditLog = ({ title = "Audit Log", isLoading, onRefresh, data }: AuditLogProps) => {
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Helper to get a short preview of context JSON
  const getContextPreview = (context?: Record<string, any>) => {
    if (!context) return 'No data';
    try {
      const entries = Object.entries(context);
      if (entries.length === 0) return 'Empty';
      
      const [key, value] = entries[0];
      const valueStr = typeof value === 'object' 
        ? JSON.stringify(value).substring(0, 15) + '...' 
        : String(value).substring(0, 15);
      
      return `${key}: ${valueStr}${entries.length > 1 ? ` (+ ${entries.length - 1} more)` : ''}`;
    } catch (e) {
      return 'Invalid data';
    }
  };

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

  // Helper to determine if log is a SystemLog
  const isSystemLog = (log: any): boolean => {
    return 'module' in log && 'event' in log && !('entity_type' in log);
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
                onClick={() => setSelectedLog(log)}
              >
                <div className="space-y-1">
                  <div className="font-medium flex flex-col sm:flex-row gap-2 sm:items-center">
                    <span>{isSystemLog(log) ? log.event : log.event_type}</span>
                    {log.module && (
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
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          log={selectedLog}
        />
      </CardContent>
    </Card>
  );
};

export default AuditLog;
