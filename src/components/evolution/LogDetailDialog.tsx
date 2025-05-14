
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SystemLog } from '@/types/logs';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface LogDetailDialogProps {
  log: SystemLog | null;
  open: boolean;
  onClose: () => void;
}

export const LogDetailDialog: React.FC<LogDetailDialogProps> = ({
  log,
  open,
  onClose
}) => {
  if (!log) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (e) {
      return dateString;
    }
  };

  const formatContextData = (context: any) => {
    if (!context) return '';
    try {
      return JSON.stringify(context, null, 2);
    } catch (e) {
      return String(context);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Log Details</span>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogTitle>
          <DialogDescription>
            Event occurred at {formatDate(log.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm">Module</h4>
              <p className="text-muted-foreground">{log.module}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Event</h4>
              <p className="text-muted-foreground">{log.event}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-1">Context Data</h4>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-80">
              {formatContextData(log.context)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailDialog;
