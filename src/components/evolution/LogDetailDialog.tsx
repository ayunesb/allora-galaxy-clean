
import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, User, Tag, FileText } from 'lucide-react';

interface LogDetailDialogProps {
  log: {
    id: string;
    created_at?: string;
    event?: string;
    message?: string;
    module?: string;
    user_id?: string;
    tenant_id?: string;
    details?: any;
    context?: any;
    level?: string;
    severity?: string;
    title?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatUser?: (userId: string) => string;
}

const LogDetailDialog: React.FC<LogDetailDialogProps> = ({
  log,
  open,
  onOpenChange,
  formatUser = (userId) => userId || 'System'
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPp');
    } catch (error) {
      return dateString;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warn': return 'bg-yellow-100 text-yellow-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'debug': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">{log.title || log.event || 'Log Details'}</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{formatDate(log.created_at)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">User:</span>
              <span className="font-medium">{log.user_id ? formatUser(log.user_id) : 'System'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Module:</span>
              <span className="font-medium">{log.module || 'Unknown'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">ID:</span>
              <span className="font-medium text-xs truncate">{log.id}</span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {log.level && (
              <Badge variant="outline" className={getLevelColor(log.level)}>
                {log.level.toUpperCase()}
              </Badge>
            )}
            
            {log.severity && (
              <Badge variant="outline" className={getSeverityColor(log.severity)}>
                {log.severity}
              </Badge>
            )}
            
            {log.tenant_id && (
              <Badge variant="outline">
                Tenant: {log.tenant_id.substring(0, 8)}
              </Badge>
            )}
          </div>
          
          {/* Message */}
          {log.message && (
            <div className="p-3 bg-muted rounded-md">
              <p className="whitespace-pre-wrap break-words">{log.message}</p>
            </div>
          )}
          
          {/* Context */}
          {(log.context || log.details) && (
            <>
              <h4 className="text-sm font-medium">Additional Details</h4>
              <ScrollArea className="h-[200px] rounded-md border">
                <pre className="p-4 text-xs">
                  {JSON.stringify(log.context || log.details, null, 2)}
                </pre>
              </ScrollArea>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailDialog;
