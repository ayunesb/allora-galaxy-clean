
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { SystemLog } from '@/types/logs';

interface LogDetailDialogProps {
  log: SystemLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopyId?: (id: string) => void;
}

export const LogDetailDialog: React.FC<LogDetailDialogProps> = ({
  log,
  open,
  onOpenChange,
  onCopyId
}) => {
  if (!log) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Log Details</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {log.created_at ? format(new Date(log.created_at), 'PPpp') : 'Unknown date'}
              </span>
              <Badge variant="outline" className="ml-2">
                {log.level}
              </Badge>
              {onCopyId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCopyId(log.id)}
                  title="Copy Log ID"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 border rounded-md">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Module</h4>
              <p className="text-sm">{log.module}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Message</h4>
              <p className="text-sm whitespace-pre-wrap">{log.message}</p>
            </div>

            {log.tenant_id && (
              <div>
                <h4 className="text-sm font-medium mb-1">Tenant ID</h4>
                <p className="text-sm font-mono">{log.tenant_id}</p>
              </div>
            )}

            {log.user_id && (
              <div>
                <h4 className="text-sm font-medium mb-1">User ID</h4>
                <p className="text-sm font-mono">{log.user_id}</p>
              </div>
            )}

            {log.details && (
              <div>
                <h4 className="text-sm font-medium mb-1">Details</h4>
                <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-1">Log ID</h4>
              <p className="text-sm font-mono">{log.id}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
