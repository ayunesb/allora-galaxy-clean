
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogDetailDialog } from './LogDetailDialog';
import { Button } from '@/components/ui/button';
import { formatDistance } from 'date-fns';

export interface Log {
  id: string;
  module: string;
  event: string;
  level?: 'info' | 'warning' | 'error' | 'success';
  context?: any;
  timestamp: string;
  tenant_id?: string;
}

// Map level to variant for badge
const getLevelVariant = (
  level?: string
): 'default' | 'secondary' | 'destructive' | 'outline' | undefined => {
  switch (level) {
    case 'error':
      return 'destructive';
    case 'warning':
      return 'outline';
    case 'info':
      return 'secondary';
    case 'success':
      return 'default';
    default:
      return 'secondary';
  }
};

interface AuditLogProps {
  logs: Log[];
  title?: string;
  emptyMessage?: string;
}

const AuditLog: React.FC<AuditLogProps> = ({
  logs,
  title = 'System Activity',
  emptyMessage = 'No activity logs found'
}) => {
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (log: Log) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 px-6">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between border-b border-border py-2 last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getLevelVariant(log.level)}>
                      {log.module}
                    </Badge>
                    <span className="font-medium">{log.event}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {log.timestamp && typeof log.timestamp === 'string'
                      ? formatDistance(new Date(log.timestamp), new Date(), { addSuffix: true })
                      : 'Unknown time'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(log)}
                >
                  Details
                </Button>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-border px-6 py-4">
        <div className="text-xs text-muted-foreground">
          Showing {logs.length} log entries
        </div>
      </CardFooter>

      {selectedLog && (
        <LogDetailDialog
          open={isDialogOpen}
          onClose={closeDialog}
          log={selectedLog}
        />
      )}
    </Card>
  );
};

export default AuditLog;
