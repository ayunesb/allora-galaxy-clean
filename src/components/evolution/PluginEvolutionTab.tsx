
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTenantId } from '@/hooks/useTenantId';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Plugin {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  xp: number;
  roi: number;
  category?: string;
  icon?: string;
  metadata?: any;
}

interface PluginLog {
  id: string;
  plugin_id: string;
  status: string;
  input?: any;
  output?: any;
  error?: string;
  created_at: string;
  execution_time?: number;
  xp_earned?: number;
}

const PluginEvolutionTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [logs, setLogs] = useState<PluginLog[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const tenantId = useTenantId();

  useEffect(() => {
    const fetchPluginData = async () => {
      try {
        setLoading(true);
        
        // Fetch plugins
        const { data: pluginData, error: pluginError } = await supabase
          .from('plugins')
          .select('*')
          .order('xp', { ascending: false })
          .limit(20);
          
        if (pluginError) throw pluginError;
        
        if (pluginData && pluginData.length > 0) {
          setPlugins(pluginData);
          setSelectedPlugin(pluginData[0]);
          
          // Fetch logs for the first plugin
          const { data: logData, error: logError } = await supabase
            .from('plugin_logs')
            .select('*')
            .eq('plugin_id', pluginData[0].id)
            .order('created_at', { ascending: false })
            .limit(50);
            
          if (logError) throw logError;
          setLogs(logData || []);
        }
      } catch (error) {
        console.error('Error fetching plugin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (tenantId) {
      fetchPluginData();
    }
  }, [tenantId]);

  const handlePluginSelect = async (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin) return;
    
    setSelectedPlugin(plugin);
    setLoading(true);
    
    try {
      // Fetch logs for the selected plugin
      const { data: logData, error: logError } = await supabase
        .from('plugin_logs')
        .select('*')
        .eq('plugin_id', pluginId)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (logError) throw logError;
      setLogs(logData || []);
    } catch (error) {
      console.error('Error fetching plugin logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy HH:mm:ss');
    } catch (e) {
      return dateStr;
    }
  };

  // Generate performance data for the chart
  const generatePerformanceData = () => {
    if (logs.length === 0) return [];
    
    const dateMap = new Map<string, { count: number, avgTime: number, success: number, failure: number }>();
    
    logs.forEach(log => {
      const date = format(new Date(log.created_at), 'MM/dd');
      const current = dateMap.get(date) || { count: 0, avgTime: 0, success: 0, failure: 0 };
      
      current.count += 1;
      current.avgTime = ((current.avgTime * (current.count - 1)) + (log.execution_time || 0)) / current.count;
      
      if (log.status === 'success') {
        current.success += 1;
      } else if (log.status === 'failure' || log.status === 'error') {
        current.failure += 1;
      }
      
      dateMap.set(date, current);
    });
    
    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => {
      const dateA = new Date(`2023/${a}`);
      const dateB = new Date(`2023/${b}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    return sortedDates.map(date => {
      const data = dateMap.get(date);
      return {
        date,
        executions: data?.count || 0,
        avgTime: data?.avgTime.toFixed(2) || 0,
        success: data?.success || 0,
        failure: data?.failure || 0,
      };
    });
  };

  if (loading && !selectedPlugin) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Plugin Evolution</span>
            {selectedPlugin && (
              <Badge variant={selectedPlugin.status === 'active' ? 'success' : 'secondary'}>
                {selectedPlugin.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plugins.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No plugins found.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-full max-w-xs">
                <Select
                  value={selectedPlugin?.id}
                  onValueChange={handlePluginSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plugin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {plugins.map((plugin) => (
                        <SelectItem key={plugin.id} value={plugin.id}>{plugin.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPlugin && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="executions">Executions</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{selectedPlugin.xp}</div>
                          <p className="text-xs text-muted-foreground">Total XP</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{selectedPlugin.roi}</div>
                          <p className="text-xs text-muted-foreground">ROI Score</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{logs.length}</div>
                          <p className="text-xs text-muted-foreground">Execution Logs</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Name</h3>
                        <p>{selectedPlugin.name}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Category</h3>
                        <p>{selectedPlugin.category || 'Uncategorized'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Status</h3>
                        <p>{selectedPlugin.status}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Created</h3>
                        <p>{formatDate(selectedPlugin.created_at)}</p>
                      </div>
                      
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium mb-2">Description</h3>
                        <p>{selectedPlugin.description || 'No description provided'}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="executions">
                    {logs.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        No execution logs found for this plugin.
                      </div>
                    ) : (
                      <div className="space-y-4 mt-4">
                        {logs.slice(0, 10).map((log) => (
                          <Card key={log.id}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Badge variant={log.status === 'success' ? 'success' : 'destructive'}>
                                    {log.status}
                                  </Badge>
                                  <p className="text-sm mt-2">
                                    {log.execution_time ? `${log.execution_time.toFixed(2)}s` : 'N/A'} |
                                    XP: {log.xp_earned || 0}
                                  </p>
                                  {log.error && (
                                    <p className="text-sm text-destructive mt-2">{log.error}</p>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(log.created_at)}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {logs.length > 10 && (
                          <div className="text-center py-4 text-muted-foreground">
                            Showing 10 of {logs.length} logs
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="performance">
                    <div className="h-80 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={generatePerformanceData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="success" name="Successful" fill="#10b981" />
                          <Bar dataKey="failure" name="Failed" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginEvolutionTab;
