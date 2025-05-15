
import { format } from 'date-fns';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemLog } from '@/types/logs';
import { Badge } from '@/components/ui/badge';
import LogDetailDialog from '@/components/admin/logs/LogDetailDialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditLogProps {
  logs: SystemLog[];
  isLoading?: boolean;
  title?: string;
  description?: string;
  limit?: number;
  userMap?: Record<string, string>;
}

export default function AuditLog({
  logs,
  isLoading = false,
  title = "Audit Log",
  description = "Recent system actions and events",
  limit = 10,
  userMap = {}
}: AuditLogProps) {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Filter logs
  const visibleLogs = logs.slice(0, limit);
  
  // Handle copy log ID
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast({
      title: "Copied!",
      description: "Log ID copied to clipboard"
    });
    
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  // Handle view log details
  const handleViewLog = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };
  
  // Get badge color based on log level
  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-destructive/15 text-destructive hover:bg-destructive/25';
      case 'warning':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25';
      case 'info':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  // Get user name
  const getUserName = (userId: string | undefined) => {
    if (!userId) return 'System';
    return userMap[userId] || 'Unknown User';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-md" />
            ))}
          </div>
        ) : visibleLogs.length > 0 ? (
          visibleLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-2 p-3 rounded-lg border bg-card text-card-foreground hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getLevelBadgeClass(log.level)}>
                    {log.level}
                  </Badge>
                  <span className="font-medium">{log.module}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {log.created_at ? format(new Date(log.created_at), 'MMM d, h:mm a') : 'N/A'}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyId(log.id)}
                      >
                        {copiedId === log.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Copy ID</TooltipContent>
                  </Tooltip>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleViewLog(log)}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm">{log.message || log.description}</p>
                {log.user_id && (
                  <p className="text-xs text-muted-foreground mt-1">
                    By {getUserName(log.user_id)}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No logs available
          </div>
        )}
      </CardContent>
      
      {selectedLog && (
        <LogDetailDialog 
          log={selectedLog} 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
        />
      )}
    </Card>
  );
}
