
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SystemLog } from '@/types/logs';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface LogDetailDialogProps {
  log: SystemLog;
  open: boolean;
  onClose: () => void;
}

export const LogDetailDialog: React.FC<LogDetailDialogProps> = ({ log, open, onClose }) => {
  // Function to format JSON for display
  const formatJson = (json: Record<string, any>) => {
    return JSON.stringify(json, null, 2);
  };

  // Function to get badge variant based on severity
  const getSeverityBadgeVariant = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'error':
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
        return 'default';
      case 'debug':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {log.event}
            {log.severity && (
              <Badge variant={getSeverityBadgeVariant(log.severity)}>
                {log.severity}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 border-b pb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Module</p>
              <p>{log.module}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
              <p>{format(new Date(log.created_at), 'PPpp')}</p>
            </div>
          </div>
          
          {log.message && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Message</p>
              <p className="text-sm">{log.message}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Context</p>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-80">
              {formatJson(log.context || {})}
            </pre>
          </div>
          
          {log.metadata && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Metadata</p>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-80">
                {formatJson(log.metadata)}
              </pre>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailDialog;
