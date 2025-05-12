
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Plugin, PluginLog } from '@/types/plugin';

const PluginEvolutionTab = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [pluginLogs, setPluginLogs] = useState<PluginLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from('plugins').select('*');
        
        if (error) throw error;
        
        // Type conversion for null fields
        const typedPlugins: Plugin[] = data?.map(p => ({
          ...p,
          description: p.description || undefined,
          xp: p.xp,
          roi: p.roi,
          created_at: p.created_at,
          updated_at: p.updated_at,
          icon: p.icon || undefined,
          category: p.category || undefined,
          metadata: p.metadata,
          tenant_id: p.tenant_id
        })) || [];
        
        setPlugins(typedPlugins);
        
        if (typedPlugins.length > 0) {
          setSelectedPlugin(typedPlugins[0]);
          fetchPluginLogs(typedPlugins[0].id);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch plugins');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlugins();
  }, []);

  const fetchPluginLogs = async (pluginId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('plugin_logs')
        .select('*')
        .eq('plugin_id', pluginId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Type conversion for null fields
      const typedLogs: PluginLog[] = data?.map(log => ({
        ...log,
        plugin_id: log.plugin_id,
        strategy_id: log.strategy_id,
        agent_version_id: log.agent_version_id,
        tenant_id: log.tenant_id,
        error: log.error,
        xp_earned: log.xp_earned,
        execution_time: log.execution_time,
        created_at: log.created_at,
        input: log.input,
        output: log.output,
        status: log.status,
        id: log.id
      })) || [];
      
      setPluginLogs(typedLogs);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch plugin logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlugin = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    fetchPluginLogs(plugin.id);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plugin Evolution</CardTitle>
          {selectedPlugin && (
            <CardDescription>
              Currently viewing: {selectedPlugin.name}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : plugins.length === 0 ? (
            <p className="text-center text-muted-foreground">No plugins available.</p>
          ) : (
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {plugins.map((plugin) => (
                  <Button
                    key={plugin.id}
                    variant={selectedPlugin?.id === plugin.id ? "default" : "outline"}
                    onClick={() => handleSelectPlugin(plugin)}
                    className="text-sm"
                  >
                    {plugin.name}
                  </Button>
                ))}
              </div>
              {selectedPlugin && (
                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="history">Logs</TabsTrigger>
                    <TabsTrigger value="versions">Versions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <Card>
                      <CardContent className="pt-6">
                        <dl className="space-y-4">
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Plugin ID</dt>
                            <dd>{selectedPlugin.id}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                            <dd>{selectedPlugin.description || 'No description'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                            <dd>{selectedPlugin.status}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-muted-foreground">XP / ROI</dt>
                            <dd>{selectedPlugin.xp} / {selectedPlugin.roi}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="history">
                    {pluginLogs.length === 0 ? (
                      <p className="text-center text-muted-foreground">No logs available.</p>
                    ) : (
                      <div className="space-y-4">
                        {pluginLogs.map((log) => (
                          <Card key={log.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium">
                                    {log.created_at ? new Date(log.created_at).toLocaleString() : 'Unknown date'}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Status: {log.status}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Execution time: {log.execution_time}ms
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    XP earned: {log.xp_earned}
                                  </p>
                                </div>
                              </div>
                              {log.error && (
                                <div className="mt-2 p-2 bg-red-50 text-red-700 rounded text-xs">
                                  {log.error}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="versions">
                    <p className="text-center text-muted-foreground">Agent version data will appear here.</p>
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
