
import React, { useState, useCallback, useMemo } from 'react'; 
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
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { SystemLog } from '@/types/logs';
import { Card } from '@/components/ui/card';
import { formatDisplayDate } from '@/lib/utils/date';
import { JsonView } from '@/components/ui/json-view';

interface SystemLogTableProps {
  logs: SystemLog[];
  isLoading: boolean;
  onViewDetails?: (log: SystemLog) => void;
}

const SystemLogTable = ({ logs, isLoading, onViewDetails }: SystemLogTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Memoized toggle function
  const toggleRow = useCallback((id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);
  
  // Memoized view details handler
  const handleViewDetails = useCallback((log: SystemLog) => {
    if (onViewDetails) {
      onViewDetails(log);
    }
  }, [onViewDetails]);
  
  if (isLoading) {
    return (
      <div className="w-full py-10 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (logs.length === 0) {
    return (
      <div className="w-full py-10 text-center">
        <p className="text-muted-foreground">No logs found matching your filters.</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]"></TableHead>
          <TableHead className="w-[180px]">Date</TableHead>
          <TableHead className="w-[120px]">Module</TableHead>
          <TableHead className="w-[150px]">Event</TableHead>
          <TableHead>Details</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <React.Fragment key={log.id}>
            <TableRow>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleRow(log.id)}
                >
                  {expandedRows[log.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
              </TableCell>
              <TableCell>{formatDisplayDate(log.created_at)}</TableCell>
              <TableCell>
                <Badge variant="outline">{log.module}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={log.event === 'error' ? 'destructive' : log.event === 'warning' ? 'warning' : 'default'}
                  className="capitalize"
                >
                  {log.event}
                </Badge>
              </TableCell>
              <TableCell className="truncate max-w-[300px]">
                {log.context?.message || log.context?.description || '-'}
              </TableCell>
              <TableCell className="text-right">
                {onViewDetails && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewDetails(log)}
                    title="View details"
                  >
                    <Eye size={16} />
                  </Button>
                )}
              </TableCell>
            </TableRow>
            {expandedRows[log.id] && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Card className="p-4 bg-muted/30">
                    <h4 className="text-sm font-medium mb-2">Context Data</h4>
                    <JsonView data={log.context || {}} />
                  </Card>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(SystemLogTable);
