
import React, { useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { SystemLog } from '@/types/logs';
import { Loader2, AlertTriangle, AlertCircle } from 'lucide-react';
import ErrorState from '@/components/errors/ErrorState';
import { Button } from '@/components/ui/button';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';

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
  showLastSeen = false,
}) => {
  const [selectedLog, setSelectedLog] = React.useState<SystemLog | null>(null);
  const [logDialogOpen, setLogDialogOpen] = React.useState<boolean>(false);
  
  // Group errors by message/type for easier analysis
  const errorGroups = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    
    const groups: Record<string, {
      id: string;
      message: string;
      module: string;
      count: number;
      firstSeen: Date;
      lastSeen: Date;
      logs: SystemLog[];
      priority: 'high' | 'medium' | 'low';
    }> = {};
    
    logs.forEach(log => {
      const context = log.context || {};
      const message = context.message || context.description || context.error || log.event;
      
      // Create a unique group key based on module and error message
      const groupKey = `${log.module}-${message}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: log.id,
          message: String(message),
          module: log.module,
          count: 0,
          firstSeen: parseISO(log.created_at),
          lastSeen: parseISO(log.created_at),
          logs: [],
          priority: 'low'
        };
      }
      
      // Update group stats
      groups[groupKey].count += 1;
      groups[groupKey].logs.push(log);
      
      const logDate = parseISO(log.created_at);
      if (logDate < groups[groupKey].firstSeen) {
        groups[groupKey].firstSeen = logDate;
      }
      if (logDate > groups[groupKey].lastSeen) {
        groups[groupKey].lastSeen = logDate;
      }
      
      // Determine priority based on frequency and recency
      if (groups[groupKey].count > 10) {
        groups[groupKey].priority = 'high';
      } else if (groups[groupKey].count > 5) {
        groups[groupKey].priority = 'medium';
      }
    });
    
    return Object.values(groups).sort((a, b) => {
      // Sort by priority first, then by count
      if (a.priority !== b.priority) {
        return a.priority === 'high' ? -1 : (a.priority === 'medium' && b.priority === 'low' ? -1 : 1);
      }
      return b.count - a.count;
    });
  }, [logs]);
  
  const handleViewDetails = (group: any) => {
    setSelectedLog(group.logs[0]);
    setLogDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (errorGroups.length === 0) {
    return (
      <ErrorState
        title="No errors found"
        message="No errors have been recorded during the selected period."
        variant="default"
      />
    );
  }
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {showPriority && <TableHead>Priority</TableHead>}
              <TableHead>Module</TableHead>
              <TableHead className="w-full">Error</TableHead>
              {showFrequency && <TableHead>Frequency</TableHead>}
              {showFirstSeen && <TableHead>First Seen</TableHead>}
              {showLastSeen && <TableHead>Last Seen</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {errorGroups.map((group) => (
              <TableRow key={group.id}>
                {showPriority && (
                  <TableCell>
                    {group.priority === 'high' && (
                      <Badge variant="destructive" className="font-medium">
                        <AlertCircle className="h-3 w-3 mr-1" />High
                      </Badge>
                    )}
                    {group.priority === 'medium' && (
                      <Badge variant="default" className="bg-yellow-500 font-medium">
                        <AlertTriangle className="h-3 w-3 mr-1" />Medium
                      </Badge>
                    )}
                    {group.priority === 'low' && (
                      <Badge variant="outline" className="font-medium">
                        Low
                      </Badge>
                    )}
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  <Badge variant="outline">{group.module}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {group.message}
                </TableCell>
                {showFrequency && (
                  <TableCell>{group.count} times</TableCell>
                )}
                {showFirstSeen && (
                  <TableCell>{format(group.firstSeen, 'MMM dd, yyyy HH:mm')}</TableCell>
                )}
                {showLastSeen && (
                  <TableCell>{format(group.lastSeen, 'MMM dd, yyyy HH:mm')}</TableCell>
                )}
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(group)}>
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <LogDetailDialog 
        log={selectedLog} 
        open={logDialogOpen} 
        onClose={() => setLogDialogOpen(false)} 
      />
    </>
  );
};

export default ErrorGroupsList;
