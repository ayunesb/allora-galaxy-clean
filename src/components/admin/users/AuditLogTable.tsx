import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination-unified';
import { AlertCircle, Info, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ErrorState } from '@/components/ui/error-state';
import { useState } from 'react';

export interface SystemLog {
  id: string;
  level: string;
  event: string;
  description: string;
  module: string;
  created_at: string;
  context: Record<string, any>;
  tenant_id: string;
}

interface AuditLogTableProps {
  userId?: string;
  tenantId?: string;
  limit?: number;
}

export function AuditLogTable({ userId, tenantId, limit = 10 }: AuditLogTableProps) {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  // Fetch system logs
  const { data, isLoading, error } = useQuery({
    queryKey: ['system-logs', userId, tenantId, page, limit],
    queryFn: async () => {
      // Create base query
      let query = supabase
        .from('system_logs')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (userId) {
        query = query.eq('context->user_id', userId);
      }
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      // Calculate pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Execute query with range pagination
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      return {
        logs: data as SystemLog[],
        totalCount: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      };
    }
  });

  const handleLogClick = (log: SystemLog) => {
    setSelectedLog(log);
  };

  const getSeverityIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-500">Warning</Badge>;
      case 'info':
        return <Badge variant="default" className="bg-blue-500">Info</Badge>;
      case 'debug':
        return <Badge variant="outline">Debug</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Logs"
        message={(error as Error).message}
        variant="destructive"
      />
    );
  }

  const logs = data?.logs || [];
  const totalPages = data?.totalPages || 0;

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/50 rounded-md">
        <p className="text-muted-foreground">No logs available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Timestamp</TableHead>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead className="w-[150px]">Module</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs">
                  {formatDate(log.created_at)}
                </TableCell>
                <TableCell>
                  {getSeverityBadge(log.level)}
                </TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell className="max-w-[300px] truncate">{log.description}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleLogClick(log)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
      )}

      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg w-full max-w-2xl mx-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                {getSeverityIcon(selectedLog.level)}
                <h3 className="text-lg font-medium">{selectedLog.event}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)}>
                &times;
              </Button>
            </div>
            
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 mb-4">
              <span className="font-medium">Timestamp:</span>
              <span>{formatDate(selectedLog.created_at)}</span>
              
              <span className="font-medium">Module:</span>
              <span>{selectedLog.module}</span>
              
              <span className="font-medium">Level:</span>
              <span>{getSeverityBadge(selectedLog.level)}</span>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-1">Description</h4>
              <p className="text-sm">{selectedLog.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Context</h4>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-[200px]">
                {JSON.stringify(selectedLog.context, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
