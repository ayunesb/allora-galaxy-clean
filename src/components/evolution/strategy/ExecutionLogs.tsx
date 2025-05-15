
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StrategyExecution } from '@/types/strategy';

interface ExecutionLogsProps {
  logs: StrategyExecution[];
  renderUser: (userId: string | undefined) => React.ReactNode;
  formatDate: (date: string) => string;
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ logs, renderUser, formatDate }) => {
  // Helper to render the status badge
  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "destructive" | "outline" | "secondary" | "success", label: string }> = {
      success: { variant: "success", label: "Success" },
      failure: { variant: "destructive", label: "Failed" },
      running: { variant: "secondary", label: "Running" },
      pending: { variant: "outline", label: "Pending" }
    };
    
    const statusInfo = statusMap[status] || { variant: "outline", label: status };
    
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No execution logs available for this strategy.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Executed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(log.start_time)}</TableCell>
                    <TableCell>{renderStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      {log.execution_time ? `${log.execution_time.toFixed(2)}ms` : 'N/A'}
                    </TableCell>
                    <TableCell>{renderUser(log.executed_by)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutionLogs;
