
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemLogs } from '@/hooks/admin/useSystemLogs';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogDetailDialog } from '@/components/evolution/LogDetailDialog';

export const AuditLogTable = () => {
  const { logs, isLoading, error, refresh } = useSystemLogs(20);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  // Get badge variant based on module
  const getModuleBadgeVariant = (module: string) => {
    switch (module?.toLowerCase()) {
      case 'auth':
        return 'outline';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'strategy':
        return 'default';
      case 'plugin':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            Error loading logs. Please try again.
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No logs found.
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-4 py-2 text-left font-medium">Event</th>
                    <th className="px-4 py-2 text-left font-medium">Module</th>
                    <th className="px-4 py-2 text-left font-medium">Time</th>
                    <th className="px-4 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-2 max-w-[200px] truncate">
                        {log.event}
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant={getModuleBadgeVariant(log.module)}>
                          {log.module}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedLog && (
          <LogDetailDialog
            log={selectedLog}
            open={showDetails}
            onClose={() => setShowDetails(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogTable;
