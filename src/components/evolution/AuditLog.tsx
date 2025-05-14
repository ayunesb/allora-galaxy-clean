
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { SystemLog } from '@/types/logs';
import LogDetailDialog from './logs/LogDetailDialog';

interface AuditLogProps {
  logs: SystemLog[];
  isLoading: boolean;
}

const AuditLog: React.FC<AuditLogProps> = ({ logs, isLoading }) => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
    } catch (e) {
      return dateString;
    }
  };
  
  // Determine badge color based on log level
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">{level}</Badge>;
      case 'warning':
        return <Badge variant="warning">{level}</Badge>;
      case 'info':
        return <Badge variant="secondary">{level}</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };
  
  // Handle opening the log detail dialog
  const handleViewDetails = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!logs.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No logs found.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs">
                  {formatDate(log.created_at)}
                </TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell>{log.event}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {log.description}
                </TableCell>
                <TableCell>{getLevelBadge(log.level)}</TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleViewDetails(log)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {selectedLog && (
        <LogDetailDialog
          log={selectedLog}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  );
};

export default AuditLog;
