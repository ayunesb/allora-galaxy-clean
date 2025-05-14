
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Tag,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { SystemLog } from '@/types/logs';
import { formatDistanceToNow } from 'date-fns';
import LogDetailDialog from '@/components/logs/LogDetailDialog';

interface ErrorGroupsListProps {
  logs: SystemLog[];
  isLoading: boolean;
  showPriority?: boolean;
  showFrequency?: boolean;
  showFirstSeen?: boolean;
  showLastSeen?: boolean;
}

const ErrorGroupsList: React.FC<ErrorGroupsListProps> = ({
  logs,
  isLoading,
  showPriority = false,
  showFrequency = false,
  showFirstSeen = false,
  showLastSeen = true
}) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  
  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleViewDetails = (log: SystemLog) => {
    setSelectedLog(log);
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, string> = {
      critical: 'bg-destructive/10 text-destructive border-destructive/30',
      high: 'bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-500/30',
      medium: 'bg-amber-300/10 text-amber-600 dark:text-amber-400 border-amber-300/30',
      low: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
    };
    
    return (
      <Badge variant="outline" className={`${variants[severity] || ''}`}>
        {severity}
      </Badge>
    );
  };
  
  const getErrorMessage = (log: SystemLog) => {
    return log.message || log.description || log.error || log.event || 'Unknown error';
  };
  
  const getErrorType = (log: SystemLog) => {
    return log.error_type || 'Error';
  };
  
  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-5 w-full max-w-[250px]" />
            </div>
            <Skeleton className="h-4 w-full max-w-[400px] mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/20">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
        <h3 className="text-lg font-medium mb-1">No errors found</h3>
        <p className="text-muted-foreground">
          All systems are functioning properly. No errors have been detected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {logs.map(log => (
        <Collapsible
          key={log.id}
          open={openItems[log.id]}
          onOpenChange={() => toggleItem(log.id)}
          className="border rounded-md overflow-hidden"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center p-3 cursor-pointer hover:bg-muted/50">
              <div className="mr-2">
                {openItems[log.id] ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              <div className="mr-3">
                {getSeverityIcon(log.severity || 'medium')}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {getErrorMessage(log)}
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" /> 
                    {getErrorType(log)}
                  </span>
                  
                  {log.module && (
                    <span>{log.module}</span>
                  )}
                  
                  {showLastSeen && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 
                      {formatTimeAgo(log.created_at)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="ml-2 flex items-center gap-2">
                {showPriority && log.severity && (
                  <div>{getSeverityBadge(log.severity)}</div>
                )}
                
                {showFrequency && (
                  <Badge variant="secondary" className="ml-auto">
                    1 occurrence
                  </Badge>
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-3 pt-0 border-t bg-muted/20">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium w-1/4">Message</TableCell>
                    <TableCell>{log.description}</TableCell>
                  </TableRow>
                  
                  {log.tenant_id && (
                    <TableRow>
                      <TableCell className="font-medium">Tenant</TableCell>
                      <TableCell>{log.tenant_id}</TableCell>
                    </TableRow>
                  )}
                  
                  {log.user_id && (
                    <TableRow>
                      <TableCell className="font-medium">User</TableCell>
                      <TableCell>{log.user_id}</TableCell>
                    </TableRow>
                  )}
                  
                  {showFirstSeen && (
                    <TableRow>
                      <TableCell className="font-medium">First Seen</TableCell>
                      <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                  
                  {log.request_id && (
                    <TableRow>
                      <TableCell className="font-medium">Request ID</TableCell>
                      <TableCell>
                        <code className="px-1 py-0.5 bg-muted rounded text-xs font-mono">
                          {log.request_id}
                        </code>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleViewDetails(log)}>
                  View Details
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
      
      {selectedLog && (
        <LogDetailDialog
          log={selectedLog}
          open={!!selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

export default ErrorGroupsList;
