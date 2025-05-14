
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { SystemLog } from '@/types/logs';

interface LogDetailDialogProps {
  log: SystemLog;
  open: boolean;
  onClose: () => void;
}

export const LogDetailDialog: React.FC<LogDetailDialogProps> = ({
  log,
  open,
  onClose
}) => {
  const getModuleBadgeVariant = (module: string) => {
    switch (module?.toLowerCase()) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'strategy':
        return 'default';
      case 'plugin':
        return 'secondary';
      case 'auth':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{log.event}</DialogTitle>
          <div className="flex items-center mt-2 space-x-2">
            <Badge variant={getModuleBadgeVariant(log.module)}>
              {log.module}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {log.context && (
            <div>
              <h3 className="text-sm font-medium mb-1">Context Data</h3>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(log.context, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Log ID:</span>{' '}
              <span className="text-muted-foreground">{log.id}</span>
            </div>
            <div>
              <span className="font-medium">Timestamp:</span>{' '}
              <span className="text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
            {log.tenant_id && (
              <div>
                <span className="font-medium">Tenant ID:</span>{' '}
                <span className="text-muted-foreground">{log.tenant_id}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailDialog;
