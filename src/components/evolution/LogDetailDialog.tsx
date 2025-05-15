
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SystemLog } from '@/types/logs';
import { format } from 'date-fns';
import { Copy, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface LogDetailDialogProps {
  log: SystemLog | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  onCopyId?: (id: string) => void;
}

const LogDetailDialog: React.FC<LogDetailDialogProps> = ({ 
  log, 
  onOpenChange,
  open,
  onCopyId 
}) => {
  if (!log) return null;

  const handleCopyId = () => {
    if (log.id && onCopyId) {
      onCopyId(log.id);
    } else if (log.id) {
      navigator.clipboard.writeText(log.id);
    }
  };

  const formatJSON = (data: any) => {
    if (!data) return 'None';
    try {
      if (typeof data === 'string') {
        return data;
      }
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  const getLogLevelClass = () => {
    switch (log.level) {
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      case 'warning':
        return 'bg-amber-500 text-amber-50';
      case 'info':
        return 'bg-blue-500 text-blue-50';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${getLogLevelClass()}`}>
                {log.level}
              </span>
              <DialogTitle className="text-xl">Log Details</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              {log.details && <TabsTrigger value="context">Context</TabsTrigger>}
              {log.error_message && <TabsTrigger value="error">Error</TabsTrigger>}
            </TabsList>

            <TabsContent value="details" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Timestamp</h4>
                  <p className="font-mono">{format(new Date(log.created_at), 'PPpp')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Module</h4>
                  <p>{log.module}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">ID</h4>
                  <div className="flex items-center gap-1">
                    <p className="font-mono text-xs truncate">{log.id}</p>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCopyId}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {log.tenant_id && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Tenant ID</h4>
                    <p className="font-mono text-xs truncate">{log.tenant_id}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Message</h4>
                <p className="whitespace-pre-wrap">{log.message || log.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <div className="bg-muted rounded-md p-3">
                <pre className="text-xs overflow-auto whitespace-pre-wrap">{formatJSON(log.metadata)}</pre>
              </div>
            </TabsContent>

            {log.details && (
              <TabsContent value="context" className="space-y-4">
                <div className="bg-muted rounded-md p-3">
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">{formatJSON(log.details)}</pre>
                </div>
              </TabsContent>
            )}

            {log.error_message && (
              <TabsContent value="error" className="space-y-4">
                <div className="bg-destructive/10 text-destructive rounded-md p-3">
                  <h4 className="text-sm font-medium mb-1">{log.error_type || 'Error'}</h4>
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">{log.error_message}</pre>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailDialog;
