
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistance } from 'date-fns';
import { Log } from './AuditLog';

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

export interface LogDetailDialogProps {
  open: boolean;
  onClose: () => void;
  log: Log;
}

export const LogDetailDialog: React.FC<LogDetailDialogProps> = ({ open, onClose, log }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant={getLevelVariant(log.level)}>
              {log.level || 'info'}
            </Badge>
            <span>{log.event}</span>
          </DialogTitle>
          <DialogDescription className="flex justify-between text-sm">
            <span>{log.module}</span>
            <span>
              {log.timestamp && typeof log.timestamp === 'string'
                ? formatDistance(new Date(log.timestamp), new Date(), { addSuffix: true })
                : 'Unknown time'}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <h4 className="mb-2 font-medium">Context</h4>
          <div className="rounded-md bg-muted p-4">
            <ScrollArea className="h-60 w-full">
              <pre className="whitespace-pre-wrap text-xs">
                {log.context ? JSON.stringify(log.context, null, 2) : 'No context data available'}
              </pre>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
