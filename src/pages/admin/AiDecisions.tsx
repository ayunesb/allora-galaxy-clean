
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Clock, ThumbsUp, ThumbsDown, Code } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PromptDiffViewer from '@/components/PromptDiffViewer';
import AgentVotePanel from '@/components/AgentVotePanel';
import { Progress } from '@/components/ui/progress';

const AiDecisions: React.FC = () => {
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<any | null>(null);
  const [previousVersion, setPreviousVersion] = useState<any | null>(null);

  // Fetch plugins
  const { data: plugins, isLoading: loadingPlugins } = useQuery({
    queryKey: ['plugins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch agent versions for selected plugin
  const { data: agentVersions, isLoading: loadingVersions } = useQuery({
    queryKey: ['agent_versions', selectedPlugin],
    queryFn: async () => {
      if (!selectedPlugin) return [];
      
      const { data, error } = await supabase
        .from('agent_versions')
        .select(`
          *,
          created_by:created_by(email)
        `)
        .eq('plugin_id', selectedPlugin)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPlugin
  });

  // Set the current and previous versions when agent versions change
  useEffect(() => {
    if (agentVersions && agentVersions.length > 0) {
      setCurrentVersion(agentVersions[0]);
      
      if (agentVersions.length > 1) {
        setPreviousVersion(agentVersions[1]);
      } else {
        setPreviousVersion(null);
      }
    } else {
      setCurrentVersion(null);
      setPreviousVersion(null);
    }
  }, [agentVersions]);

  // Toggle agent version status
  const toggleAgentStatus = async (id: string, currentStatus: 'active' | 'deprecated') => {
    const newStatus = currentStatus === 'active' ? 'deprecated' : 'active';
    
    const { error } = await supabase
      .from('agent_versions')
      .update({ status: newStatus })
      .eq('id', id);
      
    if (!error) {
      // Refresh agent versions
      const { data } = await supabase
        .from('agent_versions')
        .select(`
          *,
          created_by:created_by(email)
        `)
        .eq('plugin_id', selectedPlugin)
        .order('created_at', { ascending: false });
        
      if (data) {
        if (data.length > 0) {
          setCurrentVersion(data[0]);
          
          if (data.length > 1) {
            setPreviousVersion(data[1]);
          } else {
            setPreviousVersion(null);
          }
        }
      }
    }
  };

  const getVoteRatio = (upvotes: number, downvotes: number) => {
    const total = upvotes + downvotes;
    if (total === 0) return 0;
    return (upvotes / total) * 100;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">AI Decisions</h1>
      <p className="text-muted-foreground mt-2">Review and audit AI decisions</p>
      
      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Agent Version History</CardTitle>
              <Select value={selectedPlugin || ''} onValueChange={setSelectedPlugin}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Plugin" />
                </SelectTrigger>
                <SelectContent>
                  {loadingPlugins ? (
                    <SelectItem value="loading" disabled>Loading plugins...</SelectItem>
                  ) : (
                    plugins?.map(plugin => (
                      <SelectItem key={plugin.id} value={plugin.id}>
                        {plugin.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedPlugin ? (
              <div className="text-center py-8">
                <p>Select a plugin to view agent versions</p>
              </div>
            ) : loadingVersions ? (
              <div className="text-center py-8">
                <p>Loading versions...</p>
              </div>
            ) : agentVersions?.length === 0 ? (
              <div className="text-center py-8">
                <p>No agent versions found for this plugin</p>
              </div>
            ) : (
              <Tabs defaultValue="versions">
                <TabsList>
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                  <TabsTrigger value="diff">Prompt Diff</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="versions" className="mt-4">
                  <div className="space-y-6">
                    {agentVersions?.map((version) => (
                      <Card key={version.id} className="overflow-hidden">
                        <CardHeader className="bg-muted pb-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium">Version: {version.version}</h3>
                                <Badge variant={version.status === 'active' ? 'default' : 'secondary'}>
                                  {version.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                                </span>
                                <span>by {version.created_by?.email || 'Unknown'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Code className="mr-1 h-4 w-4" />
                                    View Prompt
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                                  <DialogHeader>
                                    <DialogTitle>Agent Prompt - v{version.version}</DialogTitle>
                                    <DialogDescription>
                                      Created {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <pre className="mt-2 p-4 bg-muted rounded-md overflow-auto whitespace-pre-wrap">
                                    {version.prompt}
                                  </pre>
                                  <DialogFooter>
                                    <Button onClick={() => toggleAgentStatus(version.id, version.status)}>
                                      {version.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant={version.status === 'active' ? 'destructive' : 'default'} 
                                size="sm"
                                onClick={() => toggleAgentStatus(version.id, version.status)}
                              >
                                {version.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium mb-2">Performance</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">XP Earned:</span>
                                  <Badge variant="outline" className="font-mono">{version.xp} XP</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Vote Ratio:</span>
                                  <div className="flex items-center gap-2">
                                    <Progress 
                                      value={getVoteRatio(version.upvotes, version.downvotes)} 
                                      className="w-20 h-2"
                                    />
                                    <span className="text-xs">{Math.round(getVoteRatio(version.upvotes, version.downvotes))}%</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ThumbsUp className="h-4 w-4 text-green-600" />
                                  <span className="text-sm">{version.upvotes}</span>
                                  <Separator orientation="vertical" className="h-4" />
                                  <ThumbsDown className="h-4 w-4 text-red-600" />
                                  <span className="text-sm">{version.downvotes}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium mb-2">Vote on this agent version</h4>
                              <AgentVotePanel 
                                agent_version_id={version.id}
                                initialUpvotes={version.upvotes}
                                initialDownvotes={version.downvotes}
                                userId="current-user-id" // Replace with actual user ID
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="diff" className="mt-4">
                  {currentVersion && previousVersion ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-muted rounded-md p-3">
                        <div>
                          <h3 className="text-sm font-medium">Comparing:</h3>
                          <p className="text-xs text-muted-foreground">
                            v{previousVersion.version} → v{currentVersion.version}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {formatDistanceToNow(new Date(currentVersion.created_at), { addSuffix: true })}
                        </Badge>
                      </div>
                      
                      <PromptDiffViewer 
                        oldPrompt={previousVersion.prompt}
                        newPrompt={currentVersion.prompt}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                      <p className="mt-2">No previous version available for comparison</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="performance" className="mt-4">
                  <div className="text-center py-8">
                    <p>Performance metrics coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AiDecisions;
