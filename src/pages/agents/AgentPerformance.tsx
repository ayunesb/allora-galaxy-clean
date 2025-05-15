
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronUp, ChevronDown, BarChart2 } from 'lucide-react';
import { useAgentVote } from '@/components/agent/vote/useAgentVote';
import { CommentSection } from '@/components/agent/vote/CommentSection';
import { VoteButton } from '@/components/agent/vote/VoteButton';
import { DataStateHandler } from '@/components/ui/data-state-handler';

// Mock data for agent performance
const mockAgents = [
  { id: 'agent-1', name: 'Email Content Generator', upvotes: 120, downvotes: 15, xp: 485, performance: 92 },
  { id: 'agent-2', name: 'Customer Service Assistant', upvotes: 87, downvotes: 23, xp: 340, performance: 78 },
  { id: 'agent-3', name: 'Data Analysis Agent', upvotes: 64, downvotes: 8, xp: 275, performance: 86 }
];

interface AgentData {
  id: string;
  name: string;
  upvotes: number;
  downvotes: number;
  xp: number;
  performance: number;
}

const AgentPerformance: React.FC = () => {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use the agent vote hook
  const { vote, isVoting, comments, addComment } = useAgentVote();

  // Simulate fetching agent data
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAgents(mockAgents);
      } catch (error) {
        console.error('Error fetching agent data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgents();
  }, []);

  // Handle agent selection
  const handleSelectAgent = (agent: AgentData) => {
    setSelectedAgent(agent);
    setActiveTab('details');
  };

  // Handle voting
  const handleVote = async (agentId: string, voteType: 'up' | 'down') => {
    try {
      await vote({
        agentId,
        voteType: voteType === 'up' ? 'upvote' : 'downvote'
      });
      
      // Update local agent data after vote
      setAgents(agents.map(agent => {
        if (agent.id === agentId) {
          return {
            ...agent,
            upvotes: voteType === 'up' ? agent.upvotes + 1 : agent.upvotes,
            downvotes: voteType === 'down' ? agent.downvotes + 1 : agent.downvotes,
          };
        }
        return agent;
      }));
      
      // Update selected agent if it's the one that was voted on
      if (selectedAgent && selectedAgent.id === agentId) {
        setSelectedAgent({
          ...selectedAgent,
          upvotes: voteType === 'up' ? selectedAgent.upvotes + 1 : selectedAgent.upvotes,
          downvotes: voteType === 'down' ? selectedAgent.downvotes + 1 : selectedAgent.downvotes,
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agent Performance</h1>
        <p className="text-muted-foreground">Track agent performance and provide feedback through XP voting</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedAgent}>Agent Details</TabsTrigger>
          <TabsTrigger value="voting">XP Voting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Agent Performance Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <DataStateHandler
                isLoading={isLoading}
                loadingComponent={
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                        <Skeleton className="h-6 w-[200px]" />
                        <div className="flex space-x-4">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                }
                data={agents}
                renderData={() => (
                  <div className="space-y-2">
                    {agents.map(agent => (
                      <div 
                        key={agent.id} 
                        className="flex items-center justify-between p-4 border rounded-md hover:bg-muted cursor-pointer"
                        onClick={() => handleSelectAgent(agent)}
                      >
                        <div>
                          <h3 className="font-medium">{agent.name}</h3>
                          <div className="flex space-x-4 text-sm text-muted-foreground">
                            <span>XP: {agent.xp}</span>
                            <span>Performance: {agent.performance}%</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="flex items-center space-x-1">
                            <ChevronUp className="h-4 w-4 text-green-500" />
                            <span>{agent.upvotes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ChevronDown className="h-4 w-4 text-red-500" />
                            <span>{agent.downvotes}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAgent(agent);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-6 mt-4">
          {selectedAgent && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>{selectedAgent.name} Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-md">
                      <div className="text-sm text-muted-foreground">XP Earned</div>
                      <div className="text-2xl font-bold">{selectedAgent.xp}</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm text-muted-foreground">Performance</div>
                      <div className="text-2xl font-bold">{selectedAgent.performance}%</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm text-muted-foreground">Upvotes</div>
                      <div className="text-2xl font-bold">{selectedAgent.upvotes}</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-sm text-muted-foreground">Downvotes</div>
                      <div className="text-2xl font-bold">{selectedAgent.downvotes}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Performance Metrics</h3>
                    <div className="h-[200px] border rounded-md flex items-center justify-center">
                      <div className="flex flex-col items-center text-center text-muted-foreground">
                        <BarChart2 className="h-10 w-10" />
                        <p>Performance Chart</p>
                        <p className="text-xs">(Detailed metrics visualization would go here)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('voting')}
                    >
                      Vote on this Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="voting" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>XP Voting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Vote on agents to help improve their performance and effectiveness.
                Your feedback helps us refine and enhance agent capabilities.
              </p>
              
              {selectedAgent ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="font-medium">{selectedAgent.name}</h3>
                      <p className="text-sm text-muted-foreground">Current XP: {selectedAgent.xp}</p>
                    </div>
                    <div className="flex space-x-2">
                      <VoteButton 
                        type="up"
                        onClick={() => handleVote(selectedAgent.id, 'up')}
                        disabled={isVoting}
                      />
                      <VoteButton 
                        type="down"
                        onClick={() => handleVote(selectedAgent.id, 'down')}
                        disabled={isVoting}
                      />
                    </div>
                  </div>
                  
                  <CommentSection 
                    comments={comments} 
                    onAddComment={(comment) => addComment(selectedAgent.id, comment)}
                  />
                </div>
              ) : (
                <div className="text-center p-6">
                  <p>Select an agent from the overview to vote.</p>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('overview')}
                    className="mt-4"
                  >
                    Go to Overview
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentPerformance;
