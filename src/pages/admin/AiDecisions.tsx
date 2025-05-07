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
import { AlertTriangle, Clock, ThumbsUp, ThumbsDown, Code, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PromptDiffViewer from '@/components/PromptDiffViewer';
import PromptDiffAnalysis from '@/components/admin/PromptDiffAnalysis';
import AgentVotePanel from '@/components/AgentVotePanel';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { useTenantId } from '@/hooks/useTenantId';

interface AgentVersion {
  id: string;
  plugin_id: string;
  version: string;
  status: 'active' | 'training' | 'deprecated';
  prompt: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  xp: number;
  created_by: {
    email: string;
  } | null;
}

interface Plugin {
  id: string;
  name: string;
}

const AiDecisions: React.FC = () => {
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<AgentVersion | null>(null);
  const [previousVersion, setPreviousVersion] = useState<AgentVersion | null>(null);
  const [activeTab, setActiveTab] = useState<string>('versions');
  const { toast } = useToast();
  const tenantId = useTenantId();

  // Fetch plugins
  const { data: plugins, isLoading: loadingPlugins } = useQuery({
    queryKey: ['plugins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Plugin[];
    }
  });

  // Fetch agent versions for selected plugin
  const { data: agentVersions, isLoading: loadingVersions, refetch: refetchVersions } = useQuery({
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
        .order('version', { ascending: false });
      
      if (error) throw error;
      return data as AgentVersion[];
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
  const toggleAgentStatus = async (id: string, currentStatus: 'active' | 'deprecated' | 'training') => {
    try {
      let newStatus: 'active' | 'deprecated';
      
      if (currentStatus === 'active') {
        newStatus = 'deprecated';
      } else {
        newStatus = 'active';
      }
      
      const { error } = await supabase
        .from('agent_versions')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: `Agent ${newStatus}`,
        description: `The agent version has been ${newStatus === 'active' ? 'activated' : 'deprecated'}.`,
      });
      
      // Log the status change
      await logSystemEvent(
        tenantId,
        'agent',
        `agent_version_${newStatus === 'active' ? 'activated' : 'deprecated'}`,
        { agent_version_id: id }
      );
      
      // Refresh agent versions
      refetchVersions();
    } catch (error: any) {
      toast({
        title: "Error updating agent",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getVoteRatio = (upvotes: number, downvotes: number) => {
    const total = upvotes + downvotes;
    if (total === 0) return 0;
    return (upvotes / total) * 100;
  };

  // Handle tab change and log it
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    logSystemEvent(tenantId, 'admin', 'ai_decisions_tab_change', { tab: value });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">AI Decisions</h1>
      <p className="text-muted-foreground mt-2">Review and audit AI decisions</p>
      
      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Agent Version History</CardTitle>
              <div className="flex items-center gap-2">
                <Link to="/agents/performance">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Agent Performance
                  </Button>
                </Link>
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
            </div>
          </CardHeader>
          <CardContent>
            {!selectedPlugin ? (
              <EmptyState
                title="Select a plugin"
                description="Choose a plugin to view its agent version history"
                icon={<Code className="h-12 w-12" />}
              />
            ) : loadingVersions ? (
              <div className="text-center py-8">
                <p>Loading versions...</p>
              </div>
            ) : agentVersions?.length === 0 ? (
              <EmptyState
                title="No agent versions found"
                description="There are no agent versions for this plugin yet"
                icon={<AlertTriangle className="h-12 w-12 text-yellow-500" />}
              />
            ) : (
              <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
                <TabsList className="mb-4">
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                  <TabsTrigger value="diff">Prompt Diff</TabsTrigger>
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="versions">
                  <div className="space-y-6">
                    {agentVersions?.map((version) => (
                      <Card key={version.id} className="overflow-hidden">
                        <CardHeader className="bg-muted pb-2">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium">Version: {version.version}</h3>
                                <Badge variant={version.status === 'active' ? 'default' : version.status === 'training' ? 'outline' : 'secondary'}>
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
                              {version.status !== 'training' && (
                                <Button 
                                  variant={version.status === 'active' ? 'destructive' : 'default'} 
                                  size="sm"
                                  onClick={() => toggleAgentStatus(version.id, version.status)}
                                >
                                  {version.status === 'active' ? 'Deactivate' : 'Activate'}
                                </Button>
                              )}
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
                                agentVersionId={version.id} 
                                initialUpvotes={version.upvotes || 0}
                                initialDownvotes={version.downvotes || 0}
                                userId={tenantId} // Replace with actual user ID
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
                    <EmptyState
                      title="No comparison available"
                      description="There needs to be at least two versions to show a comparison"
                      icon={<AlertTriangle className="h-12 w-12 text-yellow-500" />}
                    />
                  )}
                </TabsContent>

                <TabsContent value="analysis" className="mt-4">
                  {currentVersion && previousVersion ? (
                    <PromptDiffAnalysis
                      currentPrompt={currentVersion.prompt}
                      previousPrompt={previousVersion.prompt}
                      agentVersionId={currentVersion.id}
                      pluginId={selectedPlugin || ''}
                    />
                  ) : (
                    <EmptyState
                      title="No analysis available"
                      description="There needs to be at least two versions to analyze changes"
                      icon={<AlertTriangle className="h-12 w-12 text-yellow-500" />}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="performance" className="mt-4">
                  <div className="text-center py-8">
                    <Link to="/agents/performance">
                      <Button>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Full Performance Analytics
                      </Button>
                    </Link>
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
