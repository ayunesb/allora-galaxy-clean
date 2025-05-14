
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LogDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: any | null; // Using any for flexibility with different log types
}

const LogDetailDialog: React.FC<LogDetailDialogProps> = ({
  open,
  onOpenChange,
  log
}) => {
  if (!log) return null;

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'PPpp');
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'info':
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Log Detail</span>
            {log.status && (
              <Badge className={cn('ml-2', getStatusColor(log.status))}>
                {log.status}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {log.created_at && (
              <span>Created at {formatDate(log.created_at)}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Log Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {log.id && (
              <div>
                <h4 className="text-sm font-medium">ID:</h4>
                <p className="text-sm text-muted-foreground">{log.id}</p>
              </div>
            )}
            
            {log.module && (
              <div>
                <h4 className="text-sm font-medium">Module:</h4>
                <p className="text-sm text-muted-foreground">{log.module}</p>
              </div>
            )}
            
            {log.event && (
              <div>
                <h4 className="text-sm font-medium">Event:</h4>
                <p className="text-sm text-muted-foreground">{log.event}</p>
              </div>
            )}
            
            {log.user_id && (
              <div>
                <h4 className="text-sm font-medium">User ID:</h4>
                <p className="text-sm text-muted-foreground">{log.user_id}</p>
              </div>
            )}
            
            {log.tenant_id && (
              <div>
                <h4 className="text-sm font-medium">Tenant ID:</h4>
                <p className="text-sm text-muted-foreground">{log.tenant_id}</p>
              </div>
            )}
          </div>
          
          {/* Execution Info */}
          {log.execution_time !== undefined && (
            <div>
              <h4 className="text-sm font-medium">Execution Time:</h4>
              <p className="text-sm text-muted-foreground">
                {typeof log.execution_time === 'number' 
                  ? `${log.execution_time.toFixed(2)}ms` 
                  : log.execution_time}
              </p>
            </div>
          )}
          
          {/* Message */}
          {log.message && (
            <div>
              <h4 className="text-sm font-medium">Message:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {log.message}
              </p>
            </div>
          )}
          
          {/* Input / Params */}
          {(log.input || log.params) && (
            <div>
              <h4 className="text-sm font-medium">Input/Parameters:</h4>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                {JSON.stringify(log.input || log.params, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Result / Output */}
          {(log.result || log.output) && (
            <div>
              <h4 className="text-sm font-medium">Result/Output:</h4>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                {JSON.stringify(log.result || log.output, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Error */}
          {log.error && (
            <div>
              <h4 className="text-sm font-medium text-destructive">Error:</h4>
              <pre className="text-xs bg-destructive/10 text-destructive p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                {typeof log.error === 'object' ? JSON.stringify(log.error, null, 2) : log.error}
              </pre>
            </div>
          )}
          
          {/* Metadata or Additional Info */}
          {log.metadata && (
            <div>
              <h4 className="text-sm font-medium">Additional Information:</h4>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailDialog;
