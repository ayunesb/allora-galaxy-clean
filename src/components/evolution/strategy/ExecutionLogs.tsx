
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ExecutionLog {
  id: string;
  timestamp: string;
  action: string;
  status: string;
  details?: string;
}

interface ExecutionLogsProps {
  logs: ExecutionLog[];
  formatDate: (date: string) => string;
  renderStatusBadge: (status: string) => React.ReactNode;
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({
  logs,
  formatDate,
  renderStatusBadge,
}) => {
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.timestamp)}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{renderStatusBadge(log.status)}</TableCell>
                <TableCell>{log.details || 'No details available'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ExecutionLogs;
