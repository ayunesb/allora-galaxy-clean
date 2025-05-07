
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer, ScatterChart, Scatter, ZAxis, LineChart, Line
} from 'recharts';
import { 
  Loader2, 
  ChevronLeft, 
  CloudOff,
  BarChart2,
  LineChart as LineChartIcon,
  Table2,
  AlertCircle,
  Flag
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import PageHelmet from '@/components/PageHelmet';
import { useTenantId } from '@/hooks/useTenantId';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import PromptDiffAnalysis from '@/components/admin/PromptDiffAnalysis';

const PluginEvolution = () => {
  const { id: pluginId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('xp-history');
  const { toast } = useToast();
  const navigate = useNavigate();
  const tenantId = useTenantId();

  // Fetch plugin details
  const { data: plugin, isLoading: loadingPlugin } = useQuery({
    queryKey: ['plugin', pluginId],
    queryFn: async () => {
      if (!pluginId) return null;
      
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .eq('id', pluginId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!pluginId
  });

  // Fetch plugin logs
  const { data: pluginLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['plugin_logs', pluginId],
    queryFn: async () => {
      if (!pluginId) return [];
      
      const { data, error } = await supabase
        .from('plugin_logs')
        .select('*, strategy:strategies(title)')
        .eq('plugin_id', pluginId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!pluginId
  });

  // Fetch agent versions
  const { data: agentVersions, isLoading: loadingAgents } = useQuery({
    queryKey: ['agent_versions', pluginId],
    queryFn: async () => {
      if (!pluginId) return [];
      
      const { data, error } = await supabase
        .from('agent_versions')
        .select('*')
        .eq('plugin_id', pluginId)
        .order('version', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!pluginId
  });

  // Prepare data for XP history chart
  const xpHistoryData = React.useMemo(() => {
    if (!pluginLogs) return [];
    
    // Group logs by date and sum XP
    const xpByDate: Record<string, { date: string; xp: number; count: number }> = {};
    
    pluginLogs.forEach(log => {
      const date = log.created_at.split('T')[0];
      if (!xpByDate[date]) {
        xpByDate[date] = { date, xp: 0, count: 0 };
      }
      xpByDate[date].xp += log.xp_earned || 0;
      xpByDate[date].count += 1;
    });
    
    return Object.values(xpByDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [pluginLogs]);

  // Prepare data for ROI vs Execution Time scatter chart
  const scatterData = React.useMemo(() => {
    if (!pluginLogs) return [];
    
    return pluginLogs.map(log => ({
      execution_time: log.execution_time,
      xp_earned: log.xp_earned,
      status: log.status,
      date: format(new Date(log.created_at), 'PP')
    }));
  }, [pluginLogs]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'training': 
        return 'outline';
      case 'deprecated':
      default:
        return 'secondary';
    }
  };

  // Flag an agent version for review
  const flagForReview = async (agentVersionId: string) => {
    try {
      await logSystemEvent(
        tenantId,
        'agent',
        'agent_version_flagged_for_review',
        { agent_version_id: agentVersionId, plugin_id: pluginId }
      );
      
      toast({
        title: 'Agent Version Flagged',
        description: 'This agent version has been flagged for human review.',
      });
    } catch (error: any) {
      console.error('Error flagging agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to flag agent version for review.',
        variant: 'destructive',
      });
    }
  };

  // Handle tab change and log the event
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    logSystemEvent(
      tenantId,
      'plugin',
      'evolution_tab_changed',
      { plugin_id: pluginId, tab: value }
    );
  };

  if (loadingPlugin || loadingLogs || loadingAgents) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!plugin) {
    return (
      <EmptyState
        title="Plugin not found"
        description="The requested plugin could not be found"
        icon={<CloudOff className="h-12 w-12" />}
        action={
          <Button onClick={() => navigate('/plugins')}>
            Back to Plugins
          </Button>
        }
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet
        title={`${plugin.name} Evolution`}
        description={`View the evolution history for the ${plugin.name} plugin`}
      />
      
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/plugins')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{plugin.name} Evolution</h1>
          <p className="text-muted-foreground">{plugin.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Plugin Performance</CardTitle>
              <CardDescription>Evolution history and performance metrics</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{plugin.status}</Badge>
              <Badge variant="outline" className="font-mono">{plugin.xp} XP</Badge>
              <Badge variant="outline" className="font-mono">{plugin.roi}% ROI</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="xp-history" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>XP History</span>
              </TabsTrigger>
              <TabsTrigger value="roi-exec" className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" />
                <span>ROI vs Execution Time</span>
              </TabsTrigger>
              <TabsTrigger value="executions" className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" />
                <span>Recent Executions</span>
              </TabsTrigger>
              <TabsTrigger value="versions" className="flex items-center gap-2">
                <Table2 className="h-4 w-4" />
                <span>Agent Versions</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="xp-history">
              {xpHistoryData.length > 0 ? (
                <div className="h-[400px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={xpHistoryData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <RechartsTooltip 
                        formatter={(value: any, name: string) => {
                          return name === 'xp' ? [`${value} XP`, 'XP Earned'] : [value, 'Executions'];
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="xp" name="XP Earned" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="count" name="Executions" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  title="No XP history"
                  description="This plugin has no execution history to show"
                  icon={<BarChart2 className="h-12 w-12" />}
                />
              )}
            </TabsContent>

            <TabsContent value="roi-exec">
              {scatterData.length > 0 ? (
                <div className="h-[400px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="execution_time" 
                        name="Execution Time" 
                        unit="s"
                      />
                      <YAxis 
                        type="number" 
                        dataKey="xp_earned" 
                        name="XP Earned" 
                        unit=" XP" 
                      />
                      <ZAxis type="category" dataKey="date" name="Date" />
                      <RechartsTooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value: any, name: string) => {
                          if (name === 'Execution Time') return [`${value.toFixed(2)}s`, name];
                          if (name === 'XP Earned') return [`${value} XP`, name];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Scatter 
                        name="Execution Performance" 
                        data={scatterData} 
                        fill="#8884d8" 
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  title="No execution data"
                  description="This plugin has no execution history to show"
                  icon={<LineChartIcon className="h-12 w-12" />}
                />
              )}
            </TabsContent>

            <TabsContent value="executions">
              {pluginLogs && pluginLogs.length > 0 ? (
                <div className="space-y-4 mt-4">
                  <h3 className="text-lg font-medium">Recent Plugin Executions</h3>
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={pluginLogs.slice(0, 20).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" tick={false} />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value: any) => [`${value} XP`, 'XP Earned']}
                          labelFormatter={(index) => `Execution ${index + 1}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="xp_earned" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          name="XP"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3 mt-4">
                    {pluginLogs.slice(0, 10).map((log, index) => (
                      <Card key={log.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={log.status === 'success' ? 'default' : 'destructive'}
                                >
                                  {log.status === 'success' ? 'Success' : 'Failed'}
                                </Badge>
                                {log.strategy && (
                                  <span className="text-sm font-medium">
                                    {log.strategy.title}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{log.xp_earned} XP</Badge>
                              <Badge variant="secondary">{log.execution_time.toFixed(2)}s</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {pluginLogs.length > 10 && (
                      <div className="text-center py-2">
                        <Button variant="ghost" size="sm">
                          View All ({pluginLogs.length}) Executions
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No executions found"
                  description="This plugin hasn't been executed yet"
                  icon={<LineChartIcon className="h-12 w-12" />}
                />
              )}
            </TabsContent>

            <TabsContent value="versions">
              {agentVersions && agentVersions.length > 0 ? (
                <div className="space-y-6 mt-4">
                  {agentVersions.length > 1 && (
                    <Card className="border-blue-100 bg-blue-50">
                      <CardContent className="p-4">
                        <PromptDiffAnalysis
                          currentPrompt={agentVersions[0].prompt}
                          previousPrompt={agentVersions[1].prompt}
                          agentVersionId={agentVersions[0].id}
                          pluginId={pluginId}
                        />
                      </CardContent>
                    </Card>
                  )}

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Version</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>XP</TableHead>
                          <TableHead>Votes</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agentVersions.map(version => {
                          // Check if agent is underperforming compared to previous version
                          const isUnderperforming = agentVersions.length > 1 && 
                                                   version.status === 'active' && 
                                                   version.xp < agentVersions[1].xp;
                          
                          return (
                            <TableRow key={version.id}>
                              <TableCell>v{version.version}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(version.status)}>
                                  {version.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{version.xp} XP</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-500">{version.upvotes || 0}👍</span>
                                  <span className="text-red-500">{version.downvotes || 0}👎</span>
                                </div>
                              </TableCell>
                              <TableCell>{format(new Date(version.created_at), 'PP')}</TableCell>
                              <TableCell>
                                {isUnderperforming && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex items-center gap-1 text-amber-600 border-amber-200"
                                    onClick={() => flagForReview(version.id)}
                                  >
                                    <Flag className="h-3 w-3" />
                                    <span>Flag for Review</span>
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {agentVersions.length > 0 && agentVersions[0].status === 'active' && agentVersions[0].xp < 10 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Low Performance Alert</AlertTitle>
                      <AlertDescription>
                        The current active version is showing low XP performance. Consider reviewing the prompt.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No agent versions"
                  description="This plugin has no agent versions yet"
                  icon={<Table2 className="h-12 w-12" />}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginEvolution;
