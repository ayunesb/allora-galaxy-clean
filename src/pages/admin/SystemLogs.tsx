
import React, { useState, useEffect } from 'react';
import { fetchSystemLogs, fetchLogModules, fetchTenants } from '@/lib/admin/systemLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import SystemLogFilters, { SystemLogFilter } from '@/components/admin/logs/SystemLogFilters';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import { SystemLog } from '@/types/logs';
import withRoleCheck from '@/lib/auth/withRoleCheck';

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SystemLogFilter>({});
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const logsData = await fetchSystemLogs(filters);
      setLogs(logsData);
      
      if (!modules.length) {
        const modulesData = await fetchLogModules();
        setModules(modulesData);
      }
      
      if (!tenants.length) {
        const tenantsData = await fetchTenants();
        setTenants(tenantsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleFilterChange = (newFilters: SystemLogFilter) => {
    setFilters(newFilters);
  };

  const handleLogClick = (log: SystemLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const getStatusVariant = (event: string): "default" | "secondary" | "destructive" | "outline" => {
    if (event.includes('error') || event.includes('failed')) {
      return 'destructive';
    } else if (event.includes('warning')) {
      return 'secondary';
    } else if (event.includes('success') || event.includes('completed')) {
      return 'default';
    }
    return 'outline';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Logs</h1>
        <Button onClick={handleRefresh} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <SystemLogFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            modules={modules}
            tenants={tenants}
          />
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
              <p>No logs found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleLogClick(log)}>
                      <TableCell>
                        <Badge variant={getStatusVariant(log.event)}>
                          {log.module}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.event}</TableCell>
                      <TableCell>{tenants.find(t => t.id === log.tenant_id)?.name || log.tenant_id?.substring(0, 8) || 'System'}</TableCell>
                      <TableCell>{format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <LogDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        log={selectedLog}
      />
    </div>
  );
};

export default withRoleCheck(SystemLogs, {
  roles: ['admin', 'owner'],
  redirectTo: '/unauthorized'
});
