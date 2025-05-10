
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExecutionLog {
  id: string;
  execution_type: string;
  status: string;
  created_at: string;
  duration_ms?: number;
  user_id?: string;
  metadata?: any;
  error?: string;
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);

  const handleViewDetails = (log: ExecutionLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDate(log.created_at)}</TableCell>
                  <TableCell>{log.execution_type}</TableCell>
                  <TableCell>{renderStatusBadge(log.status)}</TableCell>
                  <TableCell>
                    {log.duration_ms ? `${log.duration_ms}ms` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDetails(log)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Execution Log Details</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Execution Type:</p>
                  <p className="text-sm">{selectedLog.execution_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status:</p>
                  <p className="text-sm">{selectedLog.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date:</p>
                  <p className="text-sm">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Duration:</p>
                  <p className="text-sm">
                    {selectedLog.duration_ms ? `${selectedLog.duration_ms}ms` : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedLog.error && (
                <div>
                  <p className="text-sm font-medium">Error:</p>
                  <pre className="text-xs bg-red-50 p-2 rounded overflow-auto">
                    {selectedLog.error}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <p className="text-sm font-medium">Metadata:</p>
                  <ScrollArea className="h-[200px] rounded-md border p-2">
                    <pre className="text-xs">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExecutionLogs;
