
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Clock, Code, FileCode, LineChart as ChartIcon, Play, Settings, Star, TrendingUp, User } from 'lucide-react';
import { Plugin, PluginLog } from '@/types';

const PluginDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [pluginLogs, setPluginLogs] = useState<PluginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [xpHistory, setXpHistory] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    fetchPluginDetails();
    fetchPluginLogs();
    fetchXpHistory();
  }, [id]);

  const fetchPluginDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setPlugin(data);
    } catch (error: any) {
      toast({
        title: 'Error fetching plugin details',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPluginLogs = async () => {
    try {
      setLogsLoading(true);
      const { data, error } = await supabase
        .from('plugin_logs')
        .select('*')
        .eq('plugin_id', id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setPluginLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching plugin logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchXpHistory = async () => {
    try {
      // Generate sample XP history data for demonstration
      // In a real implementation, you'd fetch this from the database
      const now = new Date();
      const mockData = [];
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        mockData.push({
          date: date.toISOString().split('T')[0],
          xp: Math.floor(Math.random() * 100) + 50,
        });
      }
      
      setXpHistory(mockData);
    } catch (error: any) {
      console.error('Error generating XP history:', error);
    }
  };

  const getLogStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/plugins')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to plugins
          </Button>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/plugins')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to plugins
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Plugin not found</h2>
          <p className="text-muted-foreground mb-6">The plugin you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/plugins')}>
            Back to All Plugins
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/plugins')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to plugins
        </Button>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {plugin.name}
            {plugin.status === 'active' ? (
              <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {plugin.category && (
              <Badge variant="outline" className="mr-2">
                {plugin.category}
              </Badge>
            )}
            Last updated {formatDate(plugin.updated_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Run Plugin
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Experience
            </CardTitle>
            <CardDescription>Total XP earned by this plugin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{plugin.xp || 0} XP</div>
            <Progress value={((plugin.xp || 0) / 1000) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {1000 - (plugin.xp || 0)} XP until next level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Return on Investment
            </CardTitle>
            <CardDescription>Measured business impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{plugin.roi || 0}%</div>
            <Progress value={(plugin.roi || 0)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Based on {pluginLogs.length} executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Execution Stats
            </CardTitle>
            <CardDescription>Plugin performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pluginLogs.length} runs</div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-lg font-medium">
                  {pluginLogs.length === 0 
                    ? '0%' 
                    : `${Math.round((pluginLogs.filter(log => log.status === 'success').length / pluginLogs.length) * 100)}%`
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time</p>
                <p className="text-lg font-medium">
                  {pluginLogs.length === 0 
                    ? '0ms' 
                    : `${Math.round(pluginLogs.reduce((acc, log) => acc + (log.execution_time || 0), 0) / pluginLogs.length * 1000)}ms`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Plugin Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{plugin.description || 'No description available for this plugin.'}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList>
          <TabsTrigger value="performance">
            <ChartIcon className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="executions">
            <Play className="h-4 w-4 mr-2" />
            Executions
          </TabsTrigger>
          <TabsTrigger value="evolution">
            <FileCode className="h-4 w-4 mr-2" />
            Evolution
          </TabsTrigger>
          <TabsTrigger value="code">
            <Code className="h-4 w-4 mr-2" />
            Code
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>XP Growth</CardTitle>
              <CardDescription>Experience points accumulated over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={xpHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Execution Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success</span>
                    <span>{pluginLogs.filter(log => log.status === 'success').length}</span>
                  </div>
                  <Progress 
                    value={pluginLogs.length === 0 
                      ? 0 
                      : (pluginLogs.filter(log => log.status === 'success').length / pluginLogs.length) * 100
                    } 
                    className="bg-muted h-2" 
                  />
                  
                  <div className="flex justify-between text-sm mt-4">
                    <span>Failure</span>
                    <span>{pluginLogs.filter(log => log.status === 'failure' || log.status === 'error').length}</span>
                  </div>
                  <Progress 
                    value={pluginLogs.length === 0 
                      ? 0 
                      : (pluginLogs.filter(log => log.status === 'failure' || log.status === 'error').length / pluginLogs.length) * 100
                    } 
                    className="bg-muted h-2" 
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Most Common Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                {/* This would be populated from real data */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Email Campaigns</span>
                      <span>42%</span>
                    </div>
                    <Progress value={42} className="bg-muted h-2 mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Lead Qualification</span>
                      <span>28%</span>
                    </div>
                    <Progress value={28} className="bg-muted h-2 mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Product Recommendations</span>
                      <span>18%</span>
                    </div>
                    <Progress value={18} className="bg-muted h-2 mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Others</span>
                      <span>12%</span>
                    </div>
                    <Progress value={12} className="bg-muted h-2 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>
                Log of recent plugin runs and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {logsLoading ? (
                <div className="space-y-4 p-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : pluginLogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No execution logs found for this plugin</p>
                </div>
              ) : (
                <div className="divide-y">
                  {pluginLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-muted/50 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={getLogStatusColor(log.status)}>
                              {log.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(log.created_at)}
                            </span>
                            {log.strategy_id && (
                              <Badge variant="outline">
                                Strategy {log.strategy_id.substring(0, 8)}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {log.execution_time ? `${(log.execution_time * 1000).toFixed(0)}ms` : 'N/A'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">
                                {log.xp_earned || 0} XP
                              </span>
                            </div>
                            
                            {log.agent_version_id && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  Agent {log.agent_version_id.substring(0, 8)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button size="sm" variant="ghost">View Details</Button>
                      </div>
                      
                      {log.error && (
                        <div className="mt-2 p-2 bg-red-50 text-red-800 rounded text-sm">
                          {log.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Evolution</CardTitle>
              <CardDescription>
                History of changes and improvements to this plugin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 pb-6 border-l">
                {/* Timeline items */}
                <div className="relative mb-8">
                  <div className="absolute -left-[25px] bg-primary rounded-full w-4 h-4" />
                  <div className="mb-1 text-sm font-medium">Version 1.2.0</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Released 3 days ago
                  </div>
                  <div className="text-sm">
                    Added support for custom templates and improved error handling
                  </div>
                  <div className="mt-2 text-sm">
                    <Badge variant="outline" className="mr-2">+15% ROI</Badge>
                    <Badge variant="outline">+50 XP</Badge>
                  </div>
                </div>
                
                <div className="relative mb-8">
                  <div className="absolute -left-[25px] bg-muted rounded-full w-4 h-4" />
                  <div className="mb-1 text-sm font-medium">Version 1.1.0</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Released 2 weeks ago
                  </div>
                  <div className="text-sm">
                    Enhanced performance with batch processing and added new analytics
                  </div>
                  <div className="mt-2 text-sm">
                    <Badge variant="outline" className="mr-2">+8% ROI</Badge>
                    <Badge variant="outline">+35 XP</Badge>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[25px] bg-muted rounded-full w-4 h-4" />
                  <div className="mb-1 text-sm font-medium">Version 1.0.0</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Released 1 month ago
                  </div>
                  <div className="text-sm">
                    Initial release of the plugin
                  </div>
                  <div className="mt-2 text-sm">
                    <Badge variant="outline">+25 XP</Badge>
                  </div>
                </div>
              </div>
              
              <Separator className="my-8" />
              
              <div className="flex justify-end">
                <Button onClick={() => navigate(`/plugins/${id}/evolution`)}>
                  View Full Evolution History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Code</CardTitle>
              <CardDescription>
                Implementation details and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto">
                <pre>
{`// Example plugin code
export async function execute(context) {
  try {
    // Plugin implementation
    const result = await processData(context.input);
    
    return {
      success: true,
      output: result,
      xp: 10
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function processData(input) {
  // Business logic implementation
  return {
    processed: true,
    result: "Data processed successfully"
  };
}`}
                </pre>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Configuration Options</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">Input Schema</h4>
                    <div className="bg-muted rounded-md p-4 font-mono text-xs mt-1 overflow-x-auto">
                      <pre>
{`{
  "type": "object",
  "properties": {
    "query": { "type": "string" },
    "options": { 
      "type": "object",
      "properties": {
        "limit": { "type": "number" }
      }
    }
  },
  "required": ["query"]
}`}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Output Schema</h4>
                    <div className="bg-muted rounded-md p-4 font-mono text-xs mt-1 overflow-x-auto">
                      <pre>
{`{
  "type": "object",
  "properties": {
    "results": { "type": "array" },
    "metadata": { "type": "object" }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginDetailPage;
