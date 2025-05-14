
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

interface LogDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  log: any; // You can replace 'any' with a more specific type if available
  title?: string;
}

const LogDetailDialog: React.FC<LogDetailDialogProps> = ({
  isOpen,
  onClose,
  log,
  title = 'Log Details'
}) => {
  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Event ID: {log.id}
          </DialogDescription>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-semibold">Timestamp</div>
            <div>{new Date(log.created_at).toLocaleString()}</div>
            <div className="font-semibold">Event Type</div>
            <div>{log.event_type}</div>
            <div className="font-semibold">Status</div>
            <div className={log.status === 'success' ? 'text-green-500' : 'text-red-500'}>
              {log.status || 'N/A'}
            </div>
          </div>

          {log.metadata && (
            <div className="space-y-2">
              <h4 className="font-semibold">Metadata</h4>
              <ScrollArea className="h-60 rounded border p-2">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailDialog;
