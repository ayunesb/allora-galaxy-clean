
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Plugin, AgentVersion, PluginLog } from '@/types/plugin';
import { Terminal, Code2, GitBranch, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { RoiExecutionTab } from '@/components/plugins/execution';
import { ScatterDataPoint } from '@/components/plugins/execution/ScatterPlot';

const PluginDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [agentVersions, setAgentVersions] = useState<AgentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executionData, setExecutionData] = useState<ScatterDataPoint[]>([]);
  
  useEffect(() => {
    const fetchPluginDetails = async () => {
      try {
        if (!id) return;
        
        const { data: pluginData, error: pluginError } = await supabase
          .from('plugins')
          .select('*')
          .eq('id', id)
          .single();
          
        if (pluginError) throw pluginError;
        
        const { data: versionData, error: versionError } = await supabase
          .from('agent_versions')
          .select('*')
          .eq('plugin_id', id)
          .order('created_at', { ascending: false });
          
        if (versionError) throw versionError;

        // Fetch execution logs for the plugin
        const { data: logData, error: logsError } = await supabase
          .from('plugin_logs')
          .select('*')
          .eq('plugin_id', id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (logsError) throw logsError;
        
        setPlugin(pluginData);
        setAgentVersions(versionData);
        
        // Transform log data into scatter plot data points
        if (logData) {
          const scatterData: ScatterDataPoint[] = logData.map((log: PluginLog) => ({
            execution_time: log.execution_time || 0,
            xp_earned: log.xp_earned || 0,
            status: log.status,
            date: log.created_at ? format(new Date(log.created_at), 'PP') : ''
          }));
          setExecutionData(scatterData);
        }
      } catch (err: any) {
        console.error('Error fetching plugin details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPluginDetails();
  }, [id]);
  
  const goBack = () => navigate(-1);
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="ghost" onClick={goBack} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (error || !plugin) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="ghost" onClick={goBack} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {error || 'Plugin not found'}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={goBack}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" onClick={goBack} className="p-0 h-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">{plugin.name}</h1>
            <Badge variant={plugin.status === 'active' ? 'default' : 'secondary'}>
              {plugin.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{plugin.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/plugins/${id}/evolution`)}>
            <GitBranch className="mr-2 h-4 w-4" /> Evolution Chain
          </Button>
          <Button onClick={() => navigate(`/plugins/${id}/edit`)}>
            Edit Plugin
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="versions">Versions ({agentVersions.length})</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Category</h3>
                <p>{plugin.category || 'Uncategorized'}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Status</h3>
                <Badge variant={plugin.status === 'active' ? 'default' : 'secondary'}>
                  {plugin.status}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Performance</h3>
                <div className="flex gap-4">
                  <div>
                    <span className="text-2xl font-bold">{plugin.xp || 0}</span>
                    <p className="text-xs text-muted-foreground">XP Earned</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold">{plugin.roi || 0}%</span>
                    <p className="text-xs text-muted-foreground">ROI</p>
                  </div>
                </div>
              </div>
              
              {plugin.metadata && (
                <div>
                  <h3 className="font-medium mb-1">Metadata</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                    {JSON.stringify(plugin.metadata, null, 2)}
                  </pre>
                </div>
              )}
              
              <div>
                <h3 className="font-medium mb-1">Created</h3>
                <p>{plugin.created_at ? format(new Date(plugin.created_at), 'PPpp') : 'Unknown'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Agent Versions</CardTitle>
              <CardDescription>
                Version history of the agent implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agentVersions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No agent versions found
                </p>
              ) : (
                <div className="space-y-4">
                  {agentVersions.map((version, index) => (
                    <div key={version.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <Badge variant={version.status === 'active' ? 'default' : 'secondary'}>
                            {version.status}
                          </Badge>
                          <span className="ml-2 font-medium">Version {version.version}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {version.created_at ? format(new Date(version.created_at), 'PP') : 'Unknown date'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-green-500">
                              {version.upvotes || 0} Upvotes
                            </Badge>
                            <Badge variant="outline" className="text-destructive">
                              {version.downvotes || 0} Downvotes
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="relative">
                        <div className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto">
                          <Code2 className="absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
                          <p className="whitespace-pre-wrap">{version.prompt}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Terminal className="mr-1 h-3 w-3" /> Test
                        </Button>
                      </div>
                      
                      {index < agentVersions.length - 1 && (
                        <div className="flex justify-center my-2">
                          <div className="border-l-2 h-8"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Execution Logs</CardTitle>
              <CardDescription>
                Records of plugin execution and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Use our refactored RoiExecutionTab component */}
              <RoiExecutionTab scatterData={executionData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginDetailPage;
