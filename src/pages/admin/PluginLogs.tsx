
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Import proper type
import { LogStatus } from '@/types/shared';

interface PluginLog {
  id: string;
  plugin_id: string;
  status: 'success' | 'failure';
  input: any;
  output: any;
  created_at: string;
  error?: string;
  execution_time: number;
}

const PluginLogs: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<PluginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pluginIds, setPluginIds] = useState<string[]>([]);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  
  useEffect(() => {
    fetchLogs();
    fetchPlugins();
  }, []);
  
  const fetchPlugins = async () => {
    try {
      const { data, error } = await supabase
        .from('plugins')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      
      if (data) {
        // Use non-null assertion for plugin IDs
        const ids = data.map(plugin => plugin.id).filter(id => id !== null) as string[];
        setPluginIds(ids);
      }
    } catch (error: any) {
      console.error('Error fetching plugins:', error);
      toast({
        title: 'Error fetching plugins',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('plugin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      
      if (data) {
        setLogs(data as PluginLog[]);
      }
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Error fetching logs',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    // In a real implementation, this would filter the logs based on the selected filters
    toast({
      title: 'Filters applied',
      description: `Status: ${filterStatus}, Search: ${searchTerm}, Date range: ${startDate} - ${endDate}, Plugins: ${selectedPlugins.join(', ')}`,
    });
  };
  
  const handlePluginSelect = (pluginId: string) => {
    setSelectedPlugins(prev => 
      prev.includes(pluginId) 
        ? prev.filter(id => id !== pluginId)
        : [...prev, pluginId]
    );
  };
  
  const resetFilters = () => {
    setFilterStatus('all');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSelectedPlugins([]);
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Plugin Logs</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input 
                placeholder="Search by plugin ID or error..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <div className="flex gap-2">
                <Input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} 
                />
                <Input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
            </div>
            <div>
              <div className="flex gap-2">
                <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
                <Button onClick={resetFilters} variant="outline">Reset</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading logs...</div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plugin ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Execution Time</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{log.plugin_id}</span>
                      </TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" /> Success
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <AlertCircle className="h-3 w-3 mr-1" /> Failure
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{log.execution_time.toFixed(2)}s</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {log.error || 'None'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">No logs found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginLogs;
