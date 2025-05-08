
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { PluginLog } from '@/types';

const PluginLogs = () => {
  const { tenant } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<PluginLog[]>([]);
  const [filter, setFilter] = useState('all');
  const [sortBy] = useState('created_at');
  const [sortOrder] = useState('desc');
  
  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      // Mock data
      setLogs([
        {
          id: 'log-1',
          plugin_id: 'plugin-1',
          strategy_id: 'strategy-1',
          tenant_id: tenant?.id,
          status: 'success',
          input: { query: 'test query' },
          output: { result: 'test result' },
          created_at: new Date().toISOString(),
          execution_time: 1.5,
          xp_earned: 10
        },
        {
          id: 'log-2',
          plugin_id: 'plugin-2',
          strategy_id: 'strategy-1',
          tenant_id: tenant?.id,
          status: 'error',
          input: { query: 'another query' },
          error: 'Failed to execute plugin',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          execution_time: 0.8,
          xp_earned: 0
        }
      ]);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [tenant?.id]);
  
  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });
  
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleString();
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Plugin Logs</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Plugin Logs</h1>
      
      <div className="flex justify-end">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="running">Running</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredLogs.length > 0 ? (
        <Card>
          <Table>
            <TableCaption>Plugin execution logs</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Plugin ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Execution Time (s)</TableHead>
                <TableHead>XP Earned</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.plugin_id || 'Unknown'}</TableCell>
                  <TableCell>
                    <span className={
                      log.status === 'success' ? 'text-green-500' :
                      log.status === 'error' ? 'text-red-500' :
                      'text-yellow-500'
                    }>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{log.execution_time?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>{log.xp_earned || 0}</TableCell>
                  <TableCell>{formatDate(log.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No plugin logs found.</p>
        </Card>
      )}
    </div>
  );
};

export default PluginLogs;
