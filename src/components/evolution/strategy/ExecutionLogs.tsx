
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ExecutionLog {
  id: string;
  timestamp: string;
  action: string;
  status: string;
  details?: string;
  metadata?: Record<string, any>;
}

interface ExecutionLogsProps {
  logs: ExecutionLog[];
  formatDate: (date: string) => string;
  renderStatusBadge: (status: string) => React.ReactNode;
  onViewDetails?: (log: ExecutionLog) => void;
  isLoading?: boolean;
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({
  logs,
  formatDate,
  renderStatusBadge,
  onViewDetails,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No execution logs available for this strategy.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
                {onViewDetails && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{renderStatusBadge(log.status)}</TableCell>
                  <TableCell className="max-w-md truncate">{log.details || 'No details available'}</TableCell>
                  {onViewDetails && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewDetails(log)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only">Details</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutionLogs;
