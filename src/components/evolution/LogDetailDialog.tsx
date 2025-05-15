
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  log: any;
  formatDate?: (date: string) => string;
  userMap?: Record<string, string>;
}

export const LogDetailDialog: React.FC<LogDetailDialogProps> = ({
  isOpen,
  onClose,
  log,
  formatDate = (date) => format(new Date(date), 'PPpp'),
  userMap = {},
}) => {
  if (!log) return null;

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">null</span>;
    }
    
    if (typeof value === 'object') {
      return (
        <pre className="bg-muted p-2 rounded-md overflow-auto text-xs">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    
    return value.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Log Detail</DialogTitle>
          <DialogDescription>
            {log.event || log.action || 'Event'} • {formatDate(log.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-2">
            {/* Standard fields */}
            <div>
              <h3 className="text-sm font-medium mb-1">Summary</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">ID</span>
                  <span className="col-span-2 font-mono text-xs">{log.id}</span>
                </div>
                
                {log.created_by && (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-muted-foreground">Created by</span>
                    <span className="col-span-2">{userMap[log.created_by] || log.created_by}</span>
                  </div>
                )}
                
                {log.message && (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-muted-foreground">Message</span>
                    <span className="col-span-2">{log.message}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Additional fields based on log type */}
            <div>
              <h3 className="text-sm font-medium mb-1">Details</h3>
              <div className="space-y-2">
                {Object.entries(log)
                  .filter(([key]) => !['id', 'created_at', 'created_by', 'message', 'event'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-muted-foreground">{key}</span>
                      <div className="col-span-2">{renderValue(value)}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export { LogDetailDialog };
