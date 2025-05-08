
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogStatus } from '@/types/shared';

interface PluginLog {
  id: string;
  plugin_id: string;
  plugin_name?: string;
  strategy_id?: string;
  strategy_name?: string;
  status: LogStatus;
  execution_time: number;
  created_at: string;
  xp_earned: number;
}

const PluginLogs = () => {
  const { tenant } = useWorkspace();
  const [logs, setLogs] = useState<PluginLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  // We'll implement sorting later
  // const [sortBy, setSortBy] = useState<string>('created_at');
  // const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const logsPerPage = 10;
  
  useEffect(() => {
    if (tenant?.id) {
      fetchLogs();
    }
  }, [tenant?.id, currentPage, filterStatus]);
  
  const fetchLogs = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('plugin_logs')
        .select('id, plugin_id, strategy_id, status, execution_time, created_at, xp_earned, plugins(name), strategies(title)')
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * logsPerPage, currentPage * logsPerPage - 1);
      
      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Format the data
      const formattedLogs = data.map(log => ({
        id: log.id,
        plugin_id: log.plugin_id,
        plugin_name: log.plugins?.name,
        strategy_id: log.strategy_id,
        strategy_name: log.strategies?.title,
        status: log.status as LogStatus,
        execution_time: log.execution_time,
        created_at: log.created_at,
        xp_earned: log.xp_earned
      }));
      
      setLogs(formattedLogs);
      
      // Get total count for pagination
      const { count } = await supabase
        .from('plugin_logs')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenant?.id);
      
      setTotalPages(Math.ceil((count || 0) / logsPerPage));
      
    } catch (err) {
      console.error('Error fetching plugin logs:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  const handleFilterChange = (status: string | null) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const formatExecutionTime = (time: number) => {
    return `${time.toFixed(2)} sec`;
  };
  
  const getStatusBadge = (status: LogStatus) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'failure':
      case 'error':
        return <Badge variant="destructive">Failure</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Plugin Execution Logs</h1>
        <Button onClick={() => fetchLogs()}>Refresh</Button>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant={filterStatus === null ? "default" : "outline"}
          onClick={() => handleFilterChange(null)}
        >
          All
        </Button>
        <Button 
          variant={filterStatus === 'success' ? "default" : "outline"}
          onClick={() => handleFilterChange('success')}
        >
          Success
        </Button>
        <Button 
          variant={filterStatus === 'failure' ? "default" : "outline"}
          onClick={() => handleFilterChange('failure')}
        >
          Failure
        </Button>
        <Button 
          variant={filterStatus === 'pending' ? "default" : "outline"}
          onClick={() => handleFilterChange('pending')}
        >
          Pending
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Plugin Execution History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <p>Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No plugin execution logs found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plugin</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.plugin_name || log.plugin_id}</TableCell>
                      <TableCell>{log.strategy_name || log.strategy_id || '-'}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{formatExecutionTime(log.execution_time)}</TableCell>
                      <TableCell>{log.xp_earned}</TableCell>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-between items-center mt-4">
                <div>
                  Page {currentPage} of {totalPages}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginLogs;
