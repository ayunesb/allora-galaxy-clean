
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AuditLogFilter } from '@/components/evolution/logs/AuditLogFilters';
import AuditLogFilters from '@/components/evolution/logs/AuditLogFilters';
import { AuditLog as AuditLogType } from '@/types/logs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';

export interface AuditLogProps {
  logs: AuditLogType[];
  isLoading: boolean;
  onRefresh: () => void;
  title?: string;
}

const AuditLog: React.FC<AuditLogProps> = ({ logs, isLoading, onRefresh, title = 'Audit Logs' }) => {
  const [filter, setFilter] = useState<AuditLogFilter>({
    searchTerm: '',
  });

  // Get unique module options from logs
  const moduleOptions = Array.from(new Set(logs.map(log => log.module))).filter(Boolean);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        
        <AuditLogFilters
          filter={filter}
          setFilter={setFilter}
          className="mb-6"
        />
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.module}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {log.description || 'No description'}
                    </TableCell>
                    <TableCell className="text-right">
                      <LogDetailDialog log={log} />
                    </TableCell>
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

export default AuditLog;
