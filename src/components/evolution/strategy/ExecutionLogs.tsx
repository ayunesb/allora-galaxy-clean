
import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { Check, X, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { type StrategyExecution } from '@/types/strategy';

interface ExecutionLogsProps {
  executions: StrategyExecution[];
  isLoading?: boolean;
  onViewDetails?: (execution: StrategyExecution) => void;
  className?: string;
  maxHeight?: string | number;
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({
  executions,
  isLoading = false,
  onViewDetails,
  className = '',
  maxHeight = '400px',
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Get status icon
  const getStatusIcon = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'running':
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  }, []);

  // Get status badge color
  const getStatusBadge = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-blue-500">Running</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  }, []);

  // Format date
  const formatDate = useCallback((dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
    } catch (err) {
      return 'Invalid date';
    }
  }, []);

  // Format duration
  const formatDuration = useCallback((ms?: number) => {
    if (!ms) return 'N/A';
    
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }, []);

  // Toggle row expansion
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Handle view details click
  const handleViewDetails = useCallback((execution: StrategyExecution) => {
    if (onViewDetails) {
      onViewDetails(execution);
    }
  }, [onViewDetails]);

  // Memoize the sorted executions to prevent unnecessary re-renders
  const sortedExecutions = useMemo(() => {
    return [...executions].sort((a, b) => 
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
  }, [executions]);

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center h-48 ${className}`}>
        <LoadingIndicator size="md" text="Loading execution history..." />
      </div>
    );
  }

  if (sortedExecutions.length === 0) {
    return (
      <div className={`text-center p-8 text-muted-foreground ${className}`}>
        No execution logs available.
      </div>
    );
  }

  return (
    <div className={className}>
      <ScrollArea style={{ maxHeight }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Execution Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExecutions.map((execution) => (
              <React.Fragment key={execution.id}>
                <TableRow className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(execution.status)}
                      <span className="ml-2">{getStatusBadge(execution.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(execution.start_time)}</TableCell>
                  <TableCell>
                    {formatDuration(execution.duration_ms)}
                  </TableCell>
                  <TableCell>v{execution.version}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(execution.id)}
                      >
                        {expandedIds.has(execution.id) ? 'Hide' : 'Show'} Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(execution)}
                      >
                        View Logs
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedIds.has(execution.id) && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-muted/50 p-4">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Parameters:</span>
                          <pre className="text-xs mt-1 bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(execution.parameters || {}, null, 2)}
                          </pre>
                        </div>
                        
                        {execution.result && (
                          <div>
                            <span className="font-medium">Result:</span>
                            <pre className="text-xs mt-1 bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(execution.result, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {execution.error && (
                          <div>
                            <span className="font-medium text-destructive">Error:</span>
                            <pre className="text-xs mt-1 bg-destructive/10 text-destructive p-2 rounded overflow-x-auto">
                              {execution.error}
                            </pre>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default React.memo(ExecutionLogs);
