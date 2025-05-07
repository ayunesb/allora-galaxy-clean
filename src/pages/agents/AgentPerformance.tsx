
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';

const AgentPerformance: React.FC = () => {
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);

  // Fetch plugins
  const { data: plugins, isLoading: loadingPlugins } = useQuery({
    queryKey: ['agent_plugins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch agent versions for selected plugin
  const { data: agentVersions, isLoading: loadingAgentVersions } = useQuery({
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
      return data || [];
    },
    enabled: !!selectedPlugin
  });

  // Fetch execution data for selected plugin
  const { data: executions, isLoading: loadingExecutions } = useQuery({
    queryKey: ['agent_executions', selectedPlugin],
    queryFn: async () => {
      if (!selectedPlugin) return [];
      
      const { data, error } = await supabase
        .from('executions')
        .select(`*`)
        .eq('plugin_id', selectedPlugin)
        .eq('type', 'agent')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedPlugin
  });

  // Generate sample XP data for the chart (in real app, this would come from DB)
  const generateXpData = (agentId: string) => {
    // Generate some sample data points for the last 30 days
    const today = new Date();
    const data = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = subDays(today, i);
      const formattedDate = format(date, 'MMM dd');
      
      // Random value between 10 and 100 with small increments
      const value = i === 0 
        ? 100 
        : data.length > 0 
          ? data[data.length - 1].xp + Math.floor(Math.random() * 10) - 2 
          : 10 + Math.floor(Math.random() * 20);
          
      data.push({
        date: formattedDate,
        timestamp: date.toISOString(),
        xp: Math.max(0, Math.min(100, value))
      });
    }
    
    return data;
  };

  // Helper function to get vote ratio as a percentage
  const getVoteRatio = (upvotes: number, downvotes: number) => {
    const total = upvotes + downvotes;
    if (total === 0) return 0;
    return Math.round((upvotes / total) * 100);
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'failure':
        return <Badge variant="destructive">Failure</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Agent Performance</h1>
      <p className="text-muted-foreground mt-2">Track agent success rates and XP</p>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Agent Performance Dashboard</CardTitle>
              <Select value={selectedPlugin || ''} onValueChange={setSelectedPlugin}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Plugin" />
                </SelectTrigger>
                <SelectContent>
                  {loadingPlugins ? (
                    <SelectItem value="loading" disabled>Loading plugins...</SelectItem>
                  ) : plugins?.length === 0 ? (
                    <SelectItem value="none" disabled>No plugins available</SelectItem>
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
              <div className="text-center py-12">
                <p>Select a plugin to view agent performance</p>
              </div>
            ) : loadingAgentVersions || loadingExecutions ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : agentVersions?.length === 0 ? (
              <div className="text-center py-12">
                <p>No agent versions found for this plugin</p>
              </div>
            ) : (
              <Tabs defaultValue="overview">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="xp">XP History</TabsTrigger>
                  <TabsTrigger value="executions">Executions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-8">
                  {agentVersions?.map((agent) => {
                    // Filter executions for this specific agent version
                    const agentExecutions = executions?.filter(e => e.agent_version_id === agent.id) || [];
                    const successCount = agentExecutions.filter(e => e.status === 'success').length;
                    const failureCount = agentExecutions.filter(e => e.status === 'failure').length;
                    const successRate = agentExecutions.length > 0 
                      ? Math.round((successCount / agentExecutions.length) * 100) 
                      : 0;
                    
                    return (
                      <Card key={agent.id}>
                        <CardHeader className="bg-muted">
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-base">Version {agent.version}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Created by {agent.created_by?.email || 'Unknown'} • {
                                  format(parseISO(agent.created_at), 'MMM d, yyyy')
                                }
                              </p>
                            </div>
                            <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                              {agent.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">Performance Metrics</h3>
                              
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">Success Rate</span>
                                  <span className="text-xs">{successRate}%</span>
                                </div>
                                <Progress value={successRate} className="h-2" />
                              </div>
                              
                              <div className="flex justify-between">
                                <div>
                                  <p className="text-sm font-medium">XP Earned</p>
                                  <Badge variant="outline" className="font-mono mt-1">
                                    {agent.xp} XP
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">Executions</p>
                                  <p className="text-sm mt-1">
                                    {agentExecutions.length > 0
                                      ? `${agentExecutions.length} total`
                                      : 'No executions'
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">Votes</h3>
                              
                              <div className="flex justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <ThumbsUp className="h-4 w-4 text-green-600" />
                                  <span className="text-sm">{agent.upvotes}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{agent.downvotes}</span>
                                  <ThumbsDown className="h-4 w-4 text-red-600" />
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">Approval Rate</span>
                                  <span className="text-xs">
                                    {getVoteRatio(agent.upvotes, agent.downvotes)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={getVoteRatio(agent.upvotes, agent.downvotes)} 
                                  className="h-2"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">Execution Status</h3>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md">
                                  <p className="text-sm font-medium">Success</p>
                                  <p className="text-2xl font-bold text-green-600">
                                    {successCount}
                                  </p>
                                </div>
                                
                                <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
                                  <p className="text-sm font-medium">Failures</p>
                                  <p className="text-2xl font-bold text-red-600">
                                    {failureCount}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-xs text-muted-foreground">
                                Last execution: {
                                  agentExecutions.length > 0
                                    ? format(parseISO(agentExecutions[0].created_at), 'MMM d, yyyy h:mm a')
                                    : 'None'
                                }
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>
                
                <TabsContent value="xp" className="space-y-8">
                  {agentVersions?.map((agent) => (
                    <Card key={`xp-${agent.id}`}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Version {agent.version} XP History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={generateXpData(agent.id)}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => value}
                              />
                              <YAxis />
                              <Tooltip 
                                labelFormatter={(value) => `Date: ${value}`}
                                formatter={(value) => [`${value} XP`, 'Experience']}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="xp"
                                name="XP"
                                stroke="#8884d8"
                                activeDot={{ r: 8 }}
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="executions" className="space-y-8">
                  {agentVersions?.map((agent) => {
                    // Filter executions for this specific agent version
                    const agentExecutions = executions?.filter(e => e.agent_version_id === agent.id) || [];
                    
                    return (
                      <Card key={`exec-${agent.id}`}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Version {agent.version} Executions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {agentExecutions.length === 0 ? (
                            <div className="text-center py-8">
                              <p>No executions recorded for this agent version</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {agentExecutions.map((execution) => (
                                <Card key={execution.id}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-center mb-3">
                                      <div className="flex items-center gap-2">
                                        {renderStatusBadge(execution.status)}
                                        <Badge variant="outline" className="font-mono">
                                          +{execution.xp_earned} XP
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                          {execution.execution_time.toFixed(2)}s
                                        </span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {format(parseISO(execution.created_at), 'MMM d, yyyy h:mm a')}
                                      </span>
                                    </div>
                                    
                                    <Separator className="my-3" />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h3 className="text-xs font-medium mb-1">Input</h3>
                                        <div className="bg-muted rounded-md p-2 text-xs overflow-auto max-h-32">
                                          <pre className="whitespace-pre-wrap">
                                            {execution.input ? JSON.stringify(execution.input, null, 2) : 'No input data'}
                                          </pre>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h3 className="text-xs font-medium mb-1">Output</h3>
                                        <div className="bg-muted rounded-md p-2 text-xs overflow-auto max-h-32">
                                          <pre className="whitespace-pre-wrap">
                                            {execution.status === 'failure' && execution.error
                                              ? <span className="text-red-500">{execution.error}</span>
                                              : execution.output
                                              ? JSON.stringify(execution.output, null, 2)
                                              : 'No output data'
                                            }
                                          </pre>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentPerformance;
