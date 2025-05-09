
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AuditLog } from '@/types/shared';
import { formatDistance } from 'date-fns';

interface LogDetailDialogProps {
  log: AuditLog | null;
  open: boolean;
  onClose: () => void;
}

export function LogDetailDialog({ log, open, onClose }: LogDetailDialogProps) {
  if (!log) return null;
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleString()} (${formatDistance(date, new Date(), { addSuffix: true })})`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
          <DialogDescription>
            {log.module} / {log.event_type} - {formatDate(log.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="font-medium text-sm">Description</h3>
            <p className="text-sm text-muted-foreground">{log.description}</p>
          </div>
          
          {log.metadata && (
            <div>
              <h3 className="font-medium text-sm">Metadata</h3>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
          
          <div>
            <h3 className="font-medium text-sm">Event ID</h3>
            <p className="text-xs font-mono">{log.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
