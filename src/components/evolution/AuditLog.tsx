
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { AuditLogFilters } from './logs/AuditLogFilters';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AuditLogFilter, SystemEventModule } from '@/types/shared';
import { AuditLog as AuditLogType } from '@/types/logs';

interface AuditLogProps {
  logs: AuditLogType[];
  filters: AuditLogFilter;
  modules: SystemEventModule[];
  isLoading: boolean;
  onFilterChange: (filters: AuditLogFilter) => void;
  onRefresh?: () => void;
  title?: string;
}

export function AuditLog({
  logs,
  filters,
  modules,
  isLoading,
  onFilterChange,
  title = "Audit Log"
}: AuditLogProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleRefresh = () => {
    // Implement refresh logic here if needed
    console.log('Refreshing audit log');
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <CardTitle>{title}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AuditLogFilters 
            filters={filters}
            onFilterChange={onFilterChange}
            onRefresh={handleRefresh}
            modules={modules}
            isLoading={isLoading}
          />
          
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No audit logs found.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead className="hidden md:table-cell">User</TableHead>
                    <TableHead className="hidden lg:table-cell">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.module}</Badge>
                      </TableCell>
                      <TableCell>
                        {log.event}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {log.context?.user_email || log.context?.user_id || 'System'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-xs truncate">
                        {log.context?.description || log.description || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AuditLog;
