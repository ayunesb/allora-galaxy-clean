
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { BarChart, Clock, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

export const PluginEvolutionTab = () => {
  const { currentTenant } = useWorkspace();
  const tenantId = currentTenant?.id;
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  
  // Fetch plugins with their logs and stats
  const { data: plugins, isLoading } = useQuery({
    queryKey: ['plugins', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('plugins')
        .select(`
          id,
          name,
          description,
          status,
          created_at,
          updated_at,
          xp,
          roi
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching plugins:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!tenantId
  });
  
  // Fetch plugin logs for the selected plugin
  const { data: pluginLogs, isLoading: isLogsLoading } = useQuery({
    queryKey: ['pluginLogs', selectedPluginId],
    queryFn: async () => {
      if (!selectedPluginId) return [];
      
      const { data, error } = await supabase
        .from('plugin_logs')
        .select('*')
        .eq('plugin_id', selectedPluginId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching plugin logs:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!selectedPluginId
  });

  // Calculate success rate for a plugin
  const calculateSuccessRate = (pluginId: string) => {
    if (!pluginLogs) return '0%';
    
    const logs = pluginLogs.filter(log => log.plugin_id === pluginId);
    if (logs.length === 0) return 'N/A';
    
    const successful = logs.filter(log => log.status === 'success').length;
    const rate = (successful / logs.length) * 100;
    return `${rate.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Plugin Evolution</CardTitle>
            <CardDescription>
              Track how plugins evolve and perform over time
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            {plugins && plugins.length > 0 ? (
              <div className="space-y-4">
                {plugins.map((plugin) => (
                  <div key={plugin.id} className="border rounded-md">
                    <div 
                      className={`p-4 ${selectedPluginId === plugin.id ? 'bg-muted/50' : ''}`} 
                      onClick={() => setSelectedPluginId(plugin.id === selectedPluginId ? null : plugin.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{plugin.name}</h3>
                            <Badge variant={plugin.status === 'active' ? 'default' : 'outline'}>
                              {plugin.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {plugin.description || 'No description'}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center">
                          <BarChart className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="font-medium">{plugin.xp || 0}</span>
                          <span className="text-muted-foreground ml-1">XP</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(plugin.updated_at || plugin.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">ROI:</span>
                          <span className="ml-1">{plugin.roi || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No plugins found</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>
              {selectedPluginId 
                ? plugins?.find(p => p.id === selectedPluginId)?.name || 'Plugin Details'
                : 'Plugin Details'}
            </CardTitle>
            <CardDescription>
              {selectedPluginId 
                ? 'Execution history and performance metrics'
                : 'Select a plugin to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPluginId ? (
              <div>
                <Tabs defaultValue="history">
                  <TabsList>
                    <TabsTrigger value="history">Execution History</TabsTrigger>
                    <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
                  </TabsList>
                  <TabsContent value="history">
                    <div className="mt-4 max-h-[350px] overflow-y-auto">
                      {isLogsLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : pluginLogs && pluginLogs.length > 0 ? (
                        <div className="space-y-2">
                          {pluginLogs.map((log) => (
                            <div key={log.id} className="border p-3 rounded-md">
                              <div className="flex justify-between">
                                <div className="flex items-center">
                                  <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                    {log.status}
                                  </Badge>
                                  <span className="text-xs ml-2 text-muted-foreground">
                                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                                  </span>
                                </div>
                                <div className="text-xs">
                                  <span className="font-medium">XP:</span> {log.xp_earned}
                                </div>
                              </div>
                              <div className="mt-2 text-xs">
                                <div className="font-medium">Execution time:</div>
                                <div>{log.execution_time}s</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No execution logs found</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="metrics">
                    <div className="mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm font-medium">Success Rate</div>
                            <div className="text-3xl font-bold mt-2">
                              {calculateSuccessRate(selectedPluginId)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm font-medium">Total XP</div>
                            <div className="text-3xl font-bold mt-2">
                              {plugins?.find(p => p.id === selectedPluginId)?.xp || 0}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm font-medium">Avg. Execution Time</div>
                            <div className="text-3xl font-bold mt-2">
                              {isLogsLoading ? (
                                <Skeleton className="h-8 w-16" />
                              ) : pluginLogs && pluginLogs.length > 0 ? (
                                `${(pluginLogs.reduce((sum, log) => sum + (log.execution_time || 0), 0) / pluginLogs.length).toFixed(2)}s`
                              ) : (
                                'N/A'
                              )}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm font-medium">ROI Impact</div>
                            <div className="text-3xl font-bold mt-2">
                              {plugins?.find(p => p.id === selectedPluginId)?.roi || 0}%
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="mt-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-sm font-medium mb-2">XP Growth Trend</div>
                            <div className="h-40 flex items-center justify-center border rounded">
                              <p className="text-muted-foreground">XP trend visualization coming soon</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] border rounded-md p-6 text-center">
                <ArrowUpRight className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No plugin selected</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Select a plugin from the list to see details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
