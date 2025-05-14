
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SystemLog } from '@/types/logs';

interface LogDetailDialogProps {
  log: SystemLog;
  open: boolean;
  onClose: () => void;
}

export const LogDetailDialog: React.FC<LogDetailDialogProps> = ({
  log,
  open,
  onClose,
}) => {
  const formatJSON = (obj: any) => {
    try {
      if (!obj) return 'No data';
      if (typeof obj === 'string') {
        try {
          // Try to parse if it's a stringified JSON
          const parsed = JSON.parse(obj);
          return JSON.stringify(parsed, null, 2);
        } catch {
          // Return as-is if it's not JSON
          return obj;
        }
      }
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return 'Error formatting data';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Event</h4>
              <p className="text-sm">{log.event || '-'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Module</h4>
              <p className="text-sm">{log.module || '-'}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Timestamp</h4>
            <p className="text-sm">
              {new Date(log.created_at).toLocaleString()}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Context Data</h4>
            <div className="bg-muted p-4 rounded-md">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {formatJSON(log.context)}
              </pre>
            </div>
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
