
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ExecutionLogsProps {
  logs: any[];
  formatDate: (dateStr: string) => string;
  renderUser: (userId: string | undefined) => React.ReactNode;
  renderStatusBadge: (status: string) => React.ReactNode;
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({
  logs,
  formatDate,
  renderUser,
  renderStatusBadge
}) => {
  const [selectedLog, setSelectedLog] = React.useState<any | null>(null);
  
  const viewLogDetails = (log: any) => {
    setSelectedLog(log);
    // Open modal or expand details
  };
  
  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No executions found for this strategy
          </p>
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
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Executed By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Time</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.id.substring(0, 8)}</TableCell>
                  <TableCell>{renderUser(log.executed_by)}</TableCell>
                  <TableCell>{formatDate(log.created_at)}</TableCell>
                  <TableCell>{renderStatusBadge(log.status)}</TableCell>
                  <TableCell>{log.xp_earned || 0}</TableCell>
                  <TableCell>{log.execution_time ? `${log.execution_time.toFixed(2)}s` : 'N/A'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => viewLogDetails(log)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
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
