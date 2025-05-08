import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, ArrowUpRight, BarChart, ThumbsUp, ThumbsDown } from 'lucide-react';
import PromptDiffViewer from '@/components/PromptDiffViewer';
import { format } from 'date-fns';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export const AgentEvolutionTab = () => {
  const { currentTenant } = useWorkspace();
  const tenantId = currentTenant?.id;
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedVersionPair, setSelectedVersionPair] = useState<{ before: string, after: string } | null>(null);
  
  // Fetch all agent versions
  const { data: agentVersions, isLoading } = useQuery({
    queryKey: ['agentVersions', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('agent_versions')
        .select(`
          id,
          version,
          prompt,
          status,
          created_at,
          upvotes,
          downvotes,
          xp,
          created_by,
          plugin_id,
          plugins:plugin_id (name, description)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching agent versions:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!tenantId
  });

  // Group agent versions by plugin
  const agentsByPlugin = agentVersions?.reduce((acc: Record<string, any[]>, version) => {
    const pluginId = version.plugin_id || 'unknown';
    if (!acc[pluginId]) {
      acc[pluginId] = [];
    }
    acc[pluginId].push(version);
    return acc;
  }, {});
  
  const plugins = agentVersions ? Object.entries(agentsByPlugin || {}).map(([pluginId, versions]) => {
    // Get the plugin name from the first version (they should all have the same plugin name)
    const pluginName = versions[0]?.plugins?.name || 'Unknown Plugin';
    return { id: pluginId, name: pluginName, versions };
  }) : [];

  const handleViewVersionHistory = (pluginId: string) => {
    setSelectedAgent(pluginId === selectedAgent ? null : pluginId);
    setSelectedVersionPair(null);
  };

  const handleCompareVersions = (v1: any, v2: any) => {
    setSelectedVersionPair({
      before: v1.prompt,
      after: v2.prompt
    });
  };

  const getVersionNumber = (version: string) => {
    // Just return formatted version string
    return `v${version}`;
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
            <CardTitle>Agent Version History</CardTitle>
            <CardDescription>
              Track how agent prompts evolve over time
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            {plugins && plugins.length > 0 ? (
              <div className="space-y-4">
                {plugins.map((plugin) => (
                  <div key={plugin.id} className="border rounded-md">
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="font-medium">{plugin.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {plugin.versions.length} versions
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewVersionHistory(plugin.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {selectedAgent === plugin.id ? 'Hide' : 'View'}
                      </Button>
                    </div>
                    
                    {selectedAgent === plugin.id && (
                      <div className="border-t p-4 space-y-3">
                        {plugin.versions.map((version: any, index: number) => {
                          const nextVersion = plugin.versions[index - 1];
                          return (
                            <div key={version.id} className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={version.status === 'active' ? 'default' : 'outline'}>
                                    {getVersionNumber(version.version)}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {format(new Date(version.created_at), 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <ThumbsUp className="h-3 w-3 mr-1" /> {version.upvotes || 0}
                                  </span>
                                  <span className="flex items-center">
                                    <ThumbsDown className="h-3 w-3 mr-1" /> {version.downvotes || 0}
                                  </span>
                                  <span className="flex items-center">
                                    <BarChart className="h-3 w-3 mr-1" /> XP: {version.xp || 0}
                                  </span>
                                </div>
                              </div>
                              {nextVersion && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCompareVersions(nextVersion, version)}
                                >
                                  Compare
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No agent versions found</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Prompt Comparison</CardTitle>
            <CardDescription>
              Compare how prompts evolve between versions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedVersionPair ? (
              <div className="h-[400px] overflow-y-auto">
                <PromptDiffViewer 
                  oldPrompt={selectedVersionPair.before} 
                  newPrompt={selectedVersionPair.after}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] border rounded-md p-6 text-center">
                <ArrowUpRight className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No comparison selected</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Select "Compare" on any version to see changes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Track agent effectiveness across versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="xp">
            <TabsList>
              <TabsTrigger value="xp">XP Over Time</TabsTrigger>
              <TabsTrigger value="votes">Community Votes</TabsTrigger>
              <TabsTrigger value="executions">Execution Success</TabsTrigger>
            </TabsList>
            <TabsContent value="xp" className="py-4">
              <div className="h-72 flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">XP metrics visualization coming soon</p>
              </div>
            </TabsContent>
            <TabsContent value="votes" className="py-4">
              <div className="h-72 flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Voting metrics visualization coming soon</p>
              </div>
            </TabsContent>
            <TabsContent value="executions" className="py-4">
              <div className="h-72 flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Execution metrics visualization coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
