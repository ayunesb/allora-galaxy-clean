
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, ArrowDownRight, ArrowRight, RefreshCw, ThumbsUp, ThumbsDown, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import AgentVotePanel from '@/components/agent/vote/AgentVotePanel';
import { PromptDiffViewer } from '@/components/PromptDiffViewer';
import { DatePicker } from '@/components/ui/date-picker';

export const AgentEvolutionTab = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Query for agent versions
  const { data: agentVersions, isLoading } = useQuery({
    queryKey: ['agentVersions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_versions')
        .select(`
          id, 
          version, 
          status,
          prompt, 
          created_at, 
          upvotes, 
          downvotes, 
          xp,
          plugins:plugin_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return data || [];
    },
  });

  const { data: selectedAgent } = useQuery({
    queryKey: ['agentDetail', selectedAgentId],
    queryFn: async () => {
      if (!selectedAgentId) return null;
      
      const { data, error } = await supabase
        .from('agent_versions')
        .select(`
          id, 
          version, 
          status, 
          prompt, 
          created_at, 
          upvotes, 
          downvotes, 
          xp,
          created_by,
          plugin_id,
          plugins:plugin_id (name, description)
        `)
        .eq('id', selectedAgentId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!selectedAgentId,
  });

  // Query for previous version of the agent to use in diff view
  const { data: previousVersion } = useQuery({
    queryKey: ['previousAgentVersion', selectedAgentId],
    queryFn: async () => {
      if (!selectedAgent) return null;
      
      // Get previous version based on version number
      const currentVersionParts = selectedAgent.version.split('.');
      const majorVersion = parseInt(currentVersionParts[0]);
      const minorVersion = parseInt(currentVersionParts[1]);
      
      const { data, error } = await supabase
        .from('agent_versions')
        .select(`
          id, 
          version, 
          prompt, 
          created_at
        `)
        .eq('plugin_id', selectedAgent.plugin_id)
        .lt('created_at', selectedAgent.created_at)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        console.error('Error fetching previous version:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!selectedAgent,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Agent Evolution History</h2>
          <p className="text-muted-foreground">Track agent versions and performance improvements</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <DatePicker date={startDate} setDate={setStartDate} />
            <span>to</span>
            <DatePicker date={endDate} setDate={setEndDate} />
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Versions</CardTitle>
              <CardDescription>Recent agent evolutions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="divide-y">
                    {agentVersions?.map((agent: any) => (
                      <div 
                        key={agent.id} 
                        className={`p-4 cursor-pointer hover:bg-muted ${selectedAgentId === agent.id ? 'bg-muted' : ''}`}
                        onClick={() => setSelectedAgentId(agent.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                              v{agent.version}
                            </Badge>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {agent.plugins?.name || 'Unknown Plugin'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-3 w-3 text-green-500" />
                            <span className="text-xs">{agent.upvotes}</span>
                            <ThumbsDown className="h-3 w-3 text-red-500 ml-2" />
                            <span className="text-xs">{agent.downvotes}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground text-xs">
                            {new Date(agent.created_at).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="text-xs">XP: {agent.xp}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedAgent ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center">
                      Agent Version {selectedAgent.version}
                      <Badge className="ml-2" variant={selectedAgent.status === 'active' ? 'default' : 'secondary'}>
                        {selectedAgent.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{selectedAgent.plugins?.name}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setCompareMode(!compareMode)}>
                      <History className="h-4 w-4 mr-2" />
                      {compareMode ? 'Hide Changes' : 'Show Changes'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Created</span>
                      <p className="text-sm">{formatDate(selectedAgent.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Performance Score</span>
                      <div className="flex items-center mt-1">
                        <Progress value={selectedAgent.xp / 2} className="h-2 flex-grow" />
                        <span className="ml-2 text-sm">{selectedAgent.xp}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Votes</span>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 text-green-500 mr-1" />
                          <span>{selectedAgent.upvotes}</span>
                        </div>
                        <div className="flex items-center">
                          <ThumbsDown className="h-4 w-4 text-red-500 mr-1" />
                          <span>{selectedAgent.downvotes}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Effectiveness Ratio</span>
                      <p className="text-sm">
                        {selectedAgent.upvotes + selectedAgent.downvotes > 0
                          ? `${Math.round((selectedAgent.upvotes / (selectedAgent.upvotes + selectedAgent.downvotes)) * 100)}%`
                          : 'No votes yet'}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {compareMode && previousVersion ? (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Changes from v{previousVersion.version}</h3>
                      <PromptDiffViewer
                        oldPrompt={previousVersion.prompt}
                        newPrompt={selectedAgent.prompt}
                        viewMode="split"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Prompt</h3>
                      <div className="bg-muted p-4 rounded-md text-sm font-mono max-h-[400px] overflow-y-auto">
                        {selectedAgent.prompt}
                      </div>
                    </div>
                  )}
                  
                  <AgentVotePanel 
                    agentVersionId={selectedAgent.id}
                    initialUpvotes={selectedAgent.upvotes}
                    initialDownvotes={selectedAgent.downvotes}
                    userId={selectedAgent.created_by}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Related Metrics</CardTitle>
                  <CardDescription>Performance metrics for this agent version</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Success Rate</span>
                      <div className="flex items-center">
                        <Progress value={75} className="h-2 flex-grow" />
                        <span className="ml-2 text-sm">75%</span>
                      </div>
                      <span className="flex items-center text-xs text-green-500">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> +8% from previous version
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Execution Time</span>
                      <div className="flex items-center">
                        <Progress value={45} className="h-2 flex-grow" />
                        <span className="ml-2 text-sm">450ms</span>
                      </div>
                      <span className="flex items-center text-xs text-green-500">
                        <ArrowDownRight className="h-3 w-3 mr-1" /> -120ms from previous version
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-sm font-medium">ROI Impact</span>
                      <div className="flex items-center">
                        <Progress value={60} className="h-2 flex-grow" />
                        <span className="ml-2 text-sm">60%</span>
                      </div>
                      <span className="flex items-center text-xs text-green-500">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> +15% from previous version
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Select an agent to view details</p>
                <ArrowRight className="h-8 w-8 text-muted-foreground animate-pulse" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};
