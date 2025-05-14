
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import LogDetailDialog from './LogDetailDialog';

export interface Log {
  id: string;
  created_at: string;
  event_type: string;
  status: string;
  tenant_id: string;
  metadata: any;
}

export interface AuditLogProps {
  logs: Log[];
  isLoading?: boolean;
}

const AuditLog: React.FC<AuditLogProps> = ({ logs, isLoading = false }) => {
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (log: Log) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Loading audit logs...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>Recent system events and actions</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No log entries found</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{log.event_type}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeColor(log.status)}
                      >
                        {log.status}
                      </Badge>
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
            
            <LogDetailDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              log={selectedLog}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLog;
