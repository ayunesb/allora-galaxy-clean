
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { LogDetailDialog } from './LogDetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, ArrowUpDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/notifications/toast';
import type { SystemLog } from '@/types/logs';

interface AuditLogProps {
  logs: SystemLog[];
  isLoading: boolean;
  title?: string;
}

export const AuditLog = ({ logs, isLoading, title = 'Audit Log' }: AuditLogProps) => {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useToast();

  const handleViewDetails = (log: SystemLog) => {
    setSelectedLog(log);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedLogs = [...logs].sort((a, b) => {
    if (sortColumn === 'created_at') {
      const dateA = new Date(a.created_at || Date.now()).getTime();
      const dateB = new Date(b.created_at || Date.now()).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    // Default string comparison for other columns
    const valA = String(a[sortColumn as keyof SystemLog] || '');
    const valB = String(b[sortColumn as keyof SystemLog] || '');
    return sortDirection === 'asc' 
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const filteredLogs = searchTerm 
    ? sortedLogs.filter(log => 
        log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.level?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sortedLogs;

  const handleCopyLogId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Copied to clipboard",
      description: `Log ID: ${id}`
    });
  };

  if (isLoading) {
    return <AuditLogSkeleton />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle>{title}</CardTitle>
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              prefix={<Search className="w-4 h-4 text-muted-foreground" />}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Timestamp
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('level')} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Level
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('module')} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Module
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {log.created_at ? format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss') : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <LogLevelBadge level={log.level} />
                    </TableCell>
                    <TableCell>{log.module}</TableCell>
                    <TableCell className="max-w-md truncate">{log.message}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(log)}
                        title="View Details"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <LogDetailDialog
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={() => setSelectedLog(null)}
        onCopyId={handleCopyLogId}
      />
    </Card>
  );
};

const LogLevelBadge = ({ level }: { level: string }) => {
  switch (level) {
    case 'error':
      return <Badge variant="destructive">{level}</Badge>;
    case 'warning':
      return <Badge variant="default" className="bg-amber-500">{level}</Badge>;
    case 'info':
      return <Badge variant="secondary">{level}</Badge>;
    default:
      return <Badge variant="outline">{level}</Badge>;
  }
};

const AuditLogSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-64" />
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <div className="space-y-2 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
  </Card>
);

export default AuditLog;
