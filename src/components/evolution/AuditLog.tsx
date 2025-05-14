
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogDetailDialog, type LogDetail } from './logs';

interface Log {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  module: string;
  details?: Record<string, any>;
  tenant_id?: string;
  request_id?: string;
}

interface AuditLogProps {
  logs: Log[];
  title?: string;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  isLoading?: boolean;
}

const getLevelColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'error':
      return 'destructive';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    default:
      return 'secondary';
  }
};

const AuditLog: React.FC<AuditLogProps> = ({
  logs,
  title = 'Audit Log',
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  isLoading = false,
}) => {
  const [selectedLog, setSelectedLog] = useState<LogDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const visibleLogs = maxItems ? logs.slice(0, maxItems) : logs;
  
  const handleLogClick = (log: LogDetail) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };
  
  const closeDialog = () => {
    setDialogOpen(false);
  };
  
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : logs.length > 0 ? (
            <>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {visibleLogs.map((log) => (
                    <Button
                      key={log.id}
                      variant="ghost"
                      className="w-full justify-start h-auto py-2 px-3"
                      onClick={() => handleLogClick(log)}
                    >
                      <div className="flex items-center w-full text-left">
                        <Badge variant={getLevelColor(log.level)} className="mr-2">
                          {log.level.toUpperCase()}
                        </Badge>
                        <div className="flex-1 truncate mr-2">
                          <span className="block text-sm">{log.message}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
              
              {showViewAll && logs.length > maxItems && (
                <div className="pt-3 border-t mt-3">
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={onViewAll}
                  >
                    View All ({logs.length})
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No log entries available
            </div>
          )}
        </CardContent>
      </Card>
      
      <LogDetailDialog 
        isOpen={dialogOpen} 
        onClose={closeDialog} 
        log={selectedLog} 
      />
    </>
  );
};

export default AuditLog;
