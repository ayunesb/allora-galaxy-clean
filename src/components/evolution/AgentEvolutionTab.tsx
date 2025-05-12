
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTenantId } from '@/hooks/useTenantId';
import { VoteType } from '@/types/shared';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AgentVersion {
  id: string;
  version: string;
  prompt: string;
  status: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  plugin_id?: string;
  upvotes: number;
  downvotes: number;
  xp: number;
}

interface AgentVote {
  id: string;
  agent_version_id: string;
  user_id: string;
  vote_type: VoteType;
  comment?: string;
  created_at: string;
}

const AgentEvolutionTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<AgentVersion[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentVersion | null>(null);
  const [votes, setVotes] = useState<AgentVote[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const tenantId = useTenantId();

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        
        // Fetch agent versions
        const { data: agentData, error: agentError } = await supabase
          .from('agent_versions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (agentError) throw agentError;
        
        if (agentData && agentData.length > 0) {
          setAgents(agentData);
          setSelectedAgent(agentData[0]);
          
          // Fetch votes for the first agent
          const { data: voteData, error: voteError } = await supabase
            .from('agent_votes')
            .select('*')
            .eq('agent_version_id', agentData[0].id)
            .order('created_at', { ascending: false });
            
          if (voteError) throw voteError;
          setVotes(voteData || []);
        }
      } catch (error) {
        console.error('Error fetching agent data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (tenantId) {
      fetchAgentData();
    }
  }, [tenantId]);

  const handleAgentSelect = async (agent: AgentVersion) => {
    setSelectedAgent(agent);
    setLoading(true);
    
    try {
      // Fetch votes for the selected agent
      const { data: voteData, error: voteError } = await supabase
        .from('agent_votes')
        .select('*')
        .eq('agent_version_id', agent.id)
        .order('created_at', { ascending: false });
        
      if (voteError) throw voteError;
      setVotes(voteData || []);
    } catch (error) {
      console.error('Error fetching agent votes:', error);
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

  // Generate trend data for the chart
  const generateTrendData = () => {
    if (!selectedAgent) return [];
    
    const dateMap = new Map<string, number>();
    
    votes.forEach(vote => {
      const date = format(new Date(vote.created_at), 'MM/dd');
      const currentValue = dateMap.get(date) || 0;
      dateMap.set(date, currentValue + (vote.vote_type === 'upvote' ? 1 : -1));
    });
    
    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => {
      const dateA = new Date(`2023/${a}`);
      const dateB = new Date(`2023/${b}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    return sortedDates.map(date => ({
      date,
      votes: dateMap.get(date) || 0,
    }));
  };

  if (loading && !selectedAgent) {
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
            <span>Agent Evolution</span>
            {selectedAgent && (
              <Badge variant={selectedAgent.status === 'active' ? 'success' : 'secondary'}>
                {selectedAgent.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No agent versions found.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {agents.map((agent) => (
                  <Button
                    key={agent.id}
                    variant={selectedAgent?.id === agent.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAgentSelect(agent)}
                  >
                    {agent.version}
                  </Button>
                ))}
              </div>
              
              {selectedAgent && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="votes">Votes</TabsTrigger>
                    <TabsTrigger value="trends">Performance Trends</TabsTrigger>
                    <TabsTrigger value="prompt">Prompt</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{selectedAgent.upvotes}</div>
                          <p className="text-xs text-muted-foreground">Upvotes</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{selectedAgent.downvotes}</div>
                          <p className="text-xs text-muted-foreground">Downvotes</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{selectedAgent.xp}</div>
                          <p className="text-xs text-muted-foreground">Total XP</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Version</h3>
                        <p>{selectedAgent.version}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Created</h3>
                        <p>{formatDate(selectedAgent.created_at)}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Status</h3>
                        <p>{selectedAgent.status}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Updated</h3>
                        <p>{selectedAgent.updated_at ? formatDate(selectedAgent.updated_at) : 'Never updated'}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="votes">
                    {votes.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        No votes recorded for this agent version.
                      </div>
                    ) : (
                      <div className="space-y-4 mt-4">
                        {votes.map((vote) => (
                          <Card key={vote.id}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Badge variant={vote.vote_type === 'upvote' ? 'success' : 'destructive'}>
                                    {vote.vote_type}
                                  </Badge>
                                  <p className="text-sm mt-2">{vote.comment || 'No comment provided'}</p>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(vote.created_at)}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="trends">
                    <div className="h-80 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={generateTrendData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="votes" 
                            stroke="#8884d8" 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="prompt">
                    <div className="mt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <pre className="whitespace-pre-wrap text-sm">
                            {selectedAgent.prompt}
                          </pre>
                        </CardContent>
                      </Card>
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

export default AgentEvolutionTab;
