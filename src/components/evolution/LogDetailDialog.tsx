
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Log } from '@/types/logs';

interface LogDetailDialogProps {
  log: Log | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LogDetailDialog: React.FC<LogDetailDialogProps> = ({ log, open, onOpenChange }) => {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Detail: {log.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-medium">Timestamp:</h3>
            <p className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Message:</h3>
            <p className="text-sm">{log.message || log.description}</p>
          </div>

          {log.level && (
            <div>
              <h3 className="text-sm font-medium">Level:</h3>
              <p className="text-sm">{log.level}</p>
            </div>
          )}

          {log.module && (
            <div>
              <h3 className="text-sm font-medium">Module:</h3>
              <p className="text-sm">{log.module}</p>
            </div>
          )}

          {log.status && (
            <div>
              <h3 className="text-sm font-medium">Status:</h3>
              <p className="text-sm">{log.status}</p>
            </div>
          )}

          {log.metadata && (
            <div>
              <h3 className="text-sm font-medium">Metadata:</h3>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}

          {log.context && (
            <div>
              <h3 className="text-sm font-medium">Context:</h3>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {typeof log.context === 'string' ? log.context : JSON.stringify(log.context, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailDialog;
