
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PluginLog } from '@/types';

const PluginLogs: React.FC = () => {
  const [logs, setLogs] = useState<PluginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Load plugin logs
  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('plugin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }
      
      setLogs(data as PluginLog[]);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Plugin Logs</h1>
        
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchLogs} variant="outline">
            Refresh
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : logs.length === 0 ? (
            <p>No logs found matching the selected filters.</p>
          ) : (
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Badge className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                      <span className="ml-2 text-sm text-gray-500">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    {log.execution_time !== undefined && (
                      <span className="text-sm">
                        Execution time: {log.execution_time.toFixed(2)}s
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <h4 className="text-sm font-medium">Input:</h4>
                      <pre className="text-xs bg-gray-50 p-2 rounded-md overflow-x-auto max-h-32">
                        {JSON.stringify(log.input || {}, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Output:</h4>
                      <pre className="text-xs bg-gray-50 p-2 rounded-md overflow-x-auto max-h-32">
                        {JSON.stringify(log.output || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  {log.error && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-red-600">Error:</h4>
                      <pre className="text-xs bg-red-50 text-red-700 p-2 rounded-md overflow-x-auto max-h-32">
                        {log.error}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginLogs;
