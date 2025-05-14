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
  CheckCircle
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

// Helper function to group errors by type and message similarity
const groupErrorLogs = (logs: SystemLog[]): {
  groupedLogs: SystemLog[][];
  groupSummary: {
    id: string;
    message: string;
    count: number;
    firstSeen: string;
    lastSeen: string;
    errorType: string;
    severity: string;
    module: string;
    user_facing: boolean;
  }[];
} => {
  // Groups errors by error_type and message similarity
  const errorGroups: Record<string, SystemLog[]> = {};
  
  logs.forEach(log => {
    const errorType = log.error_type || 'unknown';
    const message = log.message || log.description || log.error || log.event || '';
    
    // Create a simplified key for grouping similar errors
    let groupKey = `${errorType}:${message.slice(0, 50)}`;
    
    if (!errorGroups[groupKey]) {
      errorGroups[groupKey] = [];
    }
    
    errorGroups[groupKey].push(log);
  });
  
  // Convert groups to arrays and create summaries
  const groupedLogs = Object.values(errorGroups);
  const groupSummary = groupedLogs.map(logs => {
    const firstLog = logs[0];
    return {
      id: `group-${firstLog.id}`,
      message: firstLog.message || firstLog.description || firstLog.error || firstLog.event || 'Unknown error',
      count: logs.length,
      firstSeen: logs.reduce((earliest, log) => 
        new Date(log.created_at) < new Date(earliest) ? log.created_at : earliest, 
        logs[0].created_at
      ),
      lastSeen: logs.reduce((latest, log) => 
        new Date(log.created_at) > new Date(latest) ? log.created_at : latest, 
        logs[0].created_at
      ),
      errorType: firstLog.error_type || 'Error',
      severity: firstLog.severity || 'medium',
      module: firstLog.module || 'unknown',
      user_facing: firstLog.user_facing || false
    };
  });
  
  return { groupedLogs, groupSummary };
};

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
  
  // Group errors if needed
  const shouldGroup = logs.length > 3;
  const { groupedLogs, groupSummary } = shouldGroup ? groupErrorLogs(logs) : { groupedLogs: [[]], groupSummary: [] };
  
  // The items to display - either individual logs or grouped logs
  const displayItems = shouldGroup ? groupSummary.map((group, i) => ({
    ...group,
    isGroup: true,
    relatedLogs: groupedLogs[i]
  })) : logs.map(log => ({
    ...log,
    isGroup: false,
    count: 1,
    message: log.message || log.description || log.error || log.event || 'Unknown error',
    errorType: log.error_type || 'Error',
    severity: log.severity || 'medium'
  }));
  
  // Sort by severity and then by count/timestamp
  const sortedItems = displayItems.sort((a, b) => {
    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const severityA = severityOrder[a.severity as keyof typeof severityOrder] || 999;
    const severityB = severityOrder[b.severity as keyof typeof severityOrder] || 999;
    
    if (severityA !== severityB) return severityA - severityB;
    
    // Then sort by count (for groups) or timestamp
    if (a.isGroup && b.isGroup) {
      return (b as any).count - (a as any).count;
    }
    
    // Otherwise sort by most recent first
    const dateA = new Date(a.isGroup ? (a as any).lastSeen : a.created_at);
    const dateB = new Date(b.isGroup ? (b as any).lastSeen : b.created_at);
    return dateB.getTime() - dateA.getTime();
  });
  
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
      {sortedItems.map((item: any) => {
        const isGroupItem = item.isGroup;
        const itemId = isGroupItem ? item.id : item.id;
        const isOpen = openItems[itemId] || false;
        
        return (
          <Collapsible
            key={itemId}
            open={isOpen}
            onOpenChange={() => toggleItem(itemId)}
            className="border rounded-md overflow-hidden"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center p-3 cursor-pointer hover:bg-muted/50">
                <div className="mr-2">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="mr-3">
                  {getSeverityIcon(item.severity || 'medium')}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {item.message}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" /> 
                      {item.errorType}
                    </span>
                    
                    {item.module && (
                      <span>{item.module}</span>
                    )}
                    
                    {showLastSeen && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 
                        {isGroupItem 
                          ? formatTimeAgo(item.lastSeen) 
                          : formatTimeAgo(item.created_at)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="ml-2 flex items-center gap-2">
                  {showPriority && item.severity && (
                    <div>{getSeverityBadge(item.severity)}</div>
                  )}
                  
                  {(showFrequency || isGroupItem) && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.count} {item.count === 1 ? 'occurrence' : 'occurrences'}
                    </Badge>
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-3 pt-0 border-t bg-muted/20">
                {isGroupItem ? (
                  <>
                    <div className="mb-3">
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium w-1/4">First Seen</TableCell>
                            <TableCell>{new Date(item.firstSeen).toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Last Seen</TableCell>
                            <TableCell>{new Date(item.lastSeen).toLocaleString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Occurrences</TableCell>
                            <TableCell>{item.count}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Impact</TableCell>
                            <TableCell>
                              {item.user_facing ? "User Facing" : "System Only"}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <h4 className="font-medium text-sm mb-2">Recent Occurrences</h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {item.relatedLogs.slice(0, 5).map((log: SystemLog) => (
                        <div 
                          key={log.id} 
                          className="p-2 bg-background/50 rounded border border-border/50 text-sm flex justify-between"
                        >
                          <div className="truncate flex-1">
                            {log.description || log.message || log.error || log.event}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(log.created_at)}
                            </span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 px-2"
                              onClick={() => handleViewDetails(log)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium w-1/4">Message</TableCell>
                        <TableCell>{item.description}</TableCell>
                      </TableRow>
                      
                      {item.tenant_id && (
                        <TableRow>
                          <TableCell className="font-medium">Tenant</TableCell>
                          <TableCell>{item.tenant_id}</TableCell>
                        </TableRow>
                      )}
                      
                      {item.user_id && (
                        <TableRow>
                          <TableCell className="font-medium">User</TableCell>
                          <TableCell>{item.user_id}</TableCell>
                        </TableRow>
                      )}
                      
                      {showFirstSeen && (
                        <TableRow>
                          <TableCell className="font-medium">First Seen</TableCell>
                          <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      
                      {item.request_id && (
                        <TableRow>
                          <TableCell className="font-medium">Request ID</TableCell>
                          <TableCell>
                            <code className="px-1 py-0.5 bg-muted rounded text-xs font-mono">
                              {item.request_id}
                            </code>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => {
                    if (isGroupItem && item.relatedLogs?.length) {
                      handleViewDetails(item.relatedLogs[0]);
                    } else {
                      handleViewDetails(item as SystemLog);
                    }
                  }}>
                    View Details
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
      
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
