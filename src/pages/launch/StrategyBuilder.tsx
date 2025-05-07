
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Strategy, Plugin, PluginLog } from '@/types';
import PageHelmet from '@/components/PageHelmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Loader, Plus, Play, Check, AlertTriangle, ChevronRight, XCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { mockStrategies } from '@/lib/__mocks__/mockStrategies';

// Define extended plugin type to include agent_versions
interface ExtendedPlugin extends Plugin {
  agent_versions?: {
    id: string;
    version: string;
  }[];
}

// Define extended plugin log type to include related data
interface ExtendedPluginLog extends PluginLog {
  plugins?: {
    id: string;
    name: string;
    icon?: string;
  };
  agent_versions?: {
    id: string;
    version: string;
  };
}

const StrategyBuilder: React.FC = () => {
  const tenantId = useTenantId();
  const { userRole } = useWorkspace();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Strategy states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPluginModalOpen, setIsPluginModalOpen] = useState(false);
  const [selectedPlugins, setSelectedPlugins] = useState<ExtendedPlugin[]>([]);
  const [activeStrategyId, setActiveStrategyId] = useState<string | null>(null);
  const [isExecutionSheetOpen, setIsExecutionSheetOpen] = useState(false);

  // Check if user has admin or owner role
  const hasPermission = userRole === 'owner' || userRole === 'admin';

  // Fetch strategies
  const { data: strategies, isLoading: strategiesLoading, error: strategiesError } = useQuery({
    queryKey: ['strategies', tenantId],
    queryFn: async () => {
      if (!tenantId) return mockStrategies;
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('status', ['draft', 'pending'])
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching strategies:', error);
        toast({
          title: 'Failed to load strategies',
          description: error.message,
          variant: 'destructive',
        });
        return mockStrategies;
      }
      
      return data as Strategy[];
    },
    enabled: !!tenantId,
  });

  // Fetch plugins
  const { data: plugins, isLoading: pluginsLoading } = useQuery({
    queryKey: ['plugins', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugins')
        .select('*, agent_versions(id, version)')
        .eq('status', 'active')
        .order('name');
        
      if (error) {
        console.error('Error fetching plugins:', error);
        toast({
          title: 'Failed to load plugins',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as ExtendedPlugin[];
    },
  });

  // Fetch execution logs for the active strategy
  const { data: executionLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['plugin_logs', activeStrategyId],
    queryFn: async () => {
      if (!activeStrategyId) return [];
      
      const { data, error } = await supabase
        .from('plugin_logs')
        .select(`
          *,
          plugins (id, name, icon),
          agent_versions (id, version)
        `)
        .eq('strategy_id', activeStrategyId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching logs:', error);
        return [];
      }
      
      return data as ExtendedPluginLog[];
    },
    enabled: !!activeStrategyId,
  });

  // Calculate total XP for the active strategy
  const totalStrategyXP = executionLogs?.reduce((sum, log) => sum + (log.xp_earned || 0), 0) || 0;
  
  // Find the active strategy
  const activeStrategy = strategies?.find(s => s.id === activeStrategyId);
  const completionPercentage = activeStrategy?.completion_percentage || 0;

  // Create strategy mutation
  const createStrategy = useMutation({
    mutationFn: async () => {
      if (!tenantId) {
        throw new Error('No tenant selected');
      }

      if (!title.trim()) {
        throw new Error('Strategy title is required');
      }
      
      if (!description.trim()) {
        throw new Error('Strategy description is required');
      }

      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      // Insert strategy
      const { data: strategy, error } = await supabase
        .from('strategies')
        .insert({
          tenant_id: tenantId,
          title,
          description,
          status: 'pending',
          created_by: userId,
          priority: 'medium',
          completion_percentage: 0,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Auto-assign CEO_Agent to new strategy
      if (strategy) {
        const ceoAgent = plugins?.find(p => p.name.toLowerCase().includes('ceo'))?.agent_versions?.[0];
        
        if (ceoAgent) {
          const { error: logError } = await supabase
            .from('plugin_logs')
            .insert({
              strategy_id: strategy.id,
              tenant_id: tenantId,
              plugin_id: ceoAgent.id.split('.')[0], // Extract plugin ID from agent version ID if needed
              agent_version_id: ceoAgent.id,
              status: 'pending',
              input: { strategy: strategy.title },
              execution_time: 0,
              xp_earned: 0,
            });
            
          if (logError) console.error('Error assigning CEO Agent:', logError);
        }
      }
      
      return strategy;
    },
    onSuccess: (strategy) => {
      queryClient.invalidateQueries({ queryKey: ['strategies', tenantId] });
      setTitle('');
      setDescription('');
      setSelectedPlugins([]);
      toast({
        title: 'Strategy created',
        description: 'Your strategy has been created successfully',
      });
      
      // Set the new strategy as active and open the plugin modal
      if (strategy) {
        setActiveStrategyId(strategy.id);
        setIsPluginModalOpen(true);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create strategy',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Execute strategy mutation
  const executeStrategy = useMutation({
    mutationFn: async (strategyId: string) => {
      return await supabase.functions.invoke('executeStrategy', { 
        body: { strategy_id: strategyId, tenant_id: tenantId } 
      });
    },
    onSuccess: (_, strategyId) => {
      queryClient.invalidateQueries({ queryKey: ['strategies', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['plugin_logs', strategyId] });
      
      toast({
        title: 'Strategy executed',
        description: 'Your strategy is being executed',
      });
      
      // Update strategy status to completed
      supabase
        .from('strategies')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', strategyId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['strategies', tenantId] });
        });
      
      // Open execution logs panel
      setIsExecutionSheetOpen(true);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to execute strategy',
        description: error.message || 'An error occurred while executing the strategy',
        variant: 'destructive',
      });
    },
  });

  // Associate plugins with strategy mutation
  const associatePlugins = useMutation({
    mutationFn: async ({ strategyId, pluginIds }: { strategyId: string, pluginIds: string[] }) => {
      if (!tenantId || !strategyId || !pluginIds.length) {
        throw new Error('Missing required information');
      }
      
      // Create a plugin_logs entry for each selected plugin with pending status
      const pluginLogs = pluginIds.map(pluginId => {
        const plugin = plugins?.find(p => p.id === pluginId);
        const agentVersionId = plugin?.agent_versions?.[0]?.id;
        
        return {
          strategy_id: strategyId,
          tenant_id: tenantId,
          plugin_id: pluginId,
          agent_version_id: agentVersionId,
          status: 'pending',
          input: { strategy: strategies?.find(s => s.id === strategyId)?.title || 'Untitled Strategy' },
          execution_time: 0,
          xp_earned: 0,
        };
      });
      
      const { error } = await supabase.from('plugin_logs').insert(pluginLogs);
      return { success: !error, error };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plugin_logs', variables.strategyId] });
      toast({
        title: 'Plugins assigned',
        description: 'Plugins have been assigned to your strategy',
      });
      setIsPluginModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to assign plugins',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Render execution status icon
  const renderExecutionStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failure':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Loader className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Handle plugin selection
  const togglePluginSelection = (plugin: ExtendedPlugin) => {
    setSelectedPlugins(prevSelected => {
      const isAlreadySelected = prevSelected.some(p => p.id === plugin.id);
      
      if (isAlreadySelected) {
        return prevSelected.filter(p => p.id !== plugin.id);
      } else {
        return [...prevSelected, plugin];
      }
    });
  };

  if (!hasPermission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHelmet 
          title="AI Strategy Builder" 
          description="Create and execute AI-driven business strategies" 
        />
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Permission Denied</CardTitle>
            <CardDescription>
              You need admin or owner privileges to access the Strategy Builder.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet 
        title="AI Strategy Builder" 
        description="Create and execute AI-driven business strategies" 
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">AI Strategy Builder</h1>
          <p className="text-muted-foreground mt-1">Create and execute AI-driven business strategies</p>
        </div>
        <Button 
          onClick={() => setTitle('New Strategy')}
          className="mt-4 md:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Strategy
        </Button>
      </div>
      
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="editor">Strategy Editor</TabsTrigger>
          <TabsTrigger value="strategies">My Strategies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{title ? title : 'Create a New Strategy'}</CardTitle>
                  <CardDescription>Define your business strategy and select plugins to execute it</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Strategy Title</label>
                    <Input
                      id="title"
                      placeholder="Enter a strategy title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Strategy Description</label>
                    <Textarea
                      id="description"
                      placeholder="Describe your strategy and objectives"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Selected Plugins ({selectedPlugins.length})</h3>
                    {selectedPlugins.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No plugins selected. Click "Select Plugins" to choose plugins for your strategy.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedPlugins.map(plugin => (
                          <Badge key={plugin.id} variant="outline" className="py-1">
                            {plugin.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsPluginModalOpen(true)}
                    disabled={!title}
                  >
                    Select Plugins
                  </Button>
                  
                  <div className="space-x-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setTitle('');
                        setDescription('');
                        setSelectedPlugins([]);
                      }}
                    >
                      Clear
                    </Button>
                    <Button 
                      onClick={() => createStrategy.mutate()}
                      disabled={!title || !description || createStrategy.isPending}
                    >
                      {createStrategy.isPending ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" /> 
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" /> 
                          Save Strategy
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            {activeStrategyId && (
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Strategy Performance</CardTitle>
                    <CardDescription>XP earned and completion metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Completion</span>
                        <span className="text-sm">{completionPercentage}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Total XP Earned</span>
                        <span className="text-lg font-bold">{totalStrategyXP}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setIsExecutionSheetOpen(true)}
                      >
                        View Execution Logs
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => executeStrategy.mutate(activeStrategyId)}
                      disabled={executeStrategy.isPending || !activeStrategyId}
                    >
                      {executeStrategy.isPending ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" /> 
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" /> 
                          Execute Strategy
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="strategies">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategiesLoading ? (
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </CardFooter>
                </Card>
              ))
            ) : strategies && strategies.length > 0 ? (
              strategies.map(strategy => (
                <Card key={strategy.id} className={activeStrategyId === strategy.id ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="mr-2">{strategy.title}</CardTitle>
                      {renderStatusBadge(strategy.status)}
                    </div>
                    <CardDescription>
                      {strategy.created_at && format(new Date(strategy.created_at), 'PPP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3">{strategy.description}</p>
                    
                    {strategy.completion_percentage > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Completion</span>
                          <span>{strategy.completion_percentage}%</span>
                        </div>
                        <Progress value={strategy.completion_percentage} className="h-1" />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setActiveStrategyId(strategy.id);
                        setIsExecutionSheetOpen(true);
                      }}
                    >
                      View Logs
                    </Button>
                    <Button 
                      variant={activeStrategyId === strategy.id ? "default" : "outline"} 
                      size="sm"
                      onClick={() => {
                        setActiveStrategyId(strategy.id);
                        // Pre-fill form fields for editing
                        setTitle(strategy.title);
                        setDescription(strategy.description);
                        
                        // Switch to editor tab
                        const editorTab = document.querySelector('[data-value="editor"]') as HTMLElement;
                        if (editorTab) editorTab.click();
                      }}
                    >
                      {activeStrategyId === strategy.id ? "Selected" : "Select"}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="lg:col-span-3 text-center p-8">
                <h3 className="text-xl font-semibold mb-2">No strategies found</h3>
                <p className="text-muted-foreground mb-4">Create your first strategy to get started.</p>
                <Button 
                  onClick={() => {
                    setTitle('New Strategy');
                    const editorTab = document.querySelector('[data-value="editor"]') as HTMLElement;
                    if (editorTab) editorTab.click();
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Create New Strategy
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Plugin Selection Modal */}
      <Dialog open={isPluginModalOpen} onOpenChange={setIsPluginModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Plugins</DialogTitle>
            <DialogDescription>
              Choose which plugins to use with your strategy
            </DialogDescription>
          </DialogHeader>
          
          {pluginsLoading ? (
            <div className="py-6 text-center">
              <Loader className="mx-auto animate-spin h-8 w-8 text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Loading plugins...</p>
            </div>
          ) : plugins && plugins.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto py-4">
              {plugins.map(plugin => (
                <div key={plugin.id} className="flex items-start space-x-3 py-3 border-b last:border-0">
                  <Checkbox 
                    id={`plugin-${plugin.id}`}
                    checked={selectedPlugins.some(p => p.id === plugin.id)}
                    onCheckedChange={() => togglePluginSelection(plugin)}
                  />
                  <div className="space-y-1">
                    <label 
                      htmlFor={`plugin-${plugin.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {plugin.name}
                    </label>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plugin.description || 'No description available'}
                    </p>
                    <div className="flex space-x-2 text-xs">
                      <Badge variant="outline" className="text-xs">
                        XP: {plugin.xp || 0}
                      </Badge>
                      {plugin.agent_versions?.[0] && (
                        <Badge variant="outline" className="text-xs">
                          v{plugin.agent_versions[0].version}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No plugins available</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPluginModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (activeStrategyId) {
                  associatePlugins.mutate({
                    strategyId: activeStrategyId,
                    pluginIds: selectedPlugins.map(p => p.id)
                  });
                } else {
                  setIsPluginModalOpen(false);
                }
              }}
              disabled={!selectedPlugins.length || associatePlugins.isPending}
            >
              {associatePlugins.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> 
                  Saving...
                </>
              ) : (
                'Save Selection'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Execution Logs Sheet */}
      <Sheet open={isExecutionSheetOpen} onOpenChange={setIsExecutionSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Execution Logs</SheetTitle>
            <SheetDescription>
              Strategy: {activeStrategy?.title || 'Unknown Strategy'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Plugin Activity</h3>
              <Badge variant="outline">
                Total XP: {totalStrategyXP}
              </Badge>
            </div>
            
            {logsLoading ? (
              <div className="py-6 text-center">
                <Loader className="mx-auto animate-spin h-8 w-8 text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Loading logs...</p>
              </div>
            ) : executionLogs && executionLogs.length > 0 ? (
              <div className="space-y-4">
                {executionLogs.map(log => (
                  <Card key={log.id}>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {renderExecutionStatusIcon(log.status)}
                          <CardTitle className="text-base">
                            {log.plugins?.name || 'Unknown Plugin'}
                          </CardTitle>
                        </div>
                        <Badge>XP +{log.xp_earned || 0}</Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {log.created_at && format(new Date(log.created_at), 'PPp')}
                        {log.agent_versions?.version && ` • v${log.agent_versions.version}`}
                        {log.execution_time ? ` • ${log.execution_time.toFixed(2)}s` : ''}
                      </CardDescription>
                    </CardHeader>
                    
                    {(log.output || log.error) && (
                      <CardContent className="p-4 pt-0">
                        {log.output && (
                          <div className="text-sm">
                            <p className="font-medium text-xs text-muted-foreground mb-1">Output:</p>
                            <div className="bg-muted rounded p-2 text-xs overflow-auto max-h-32">
                              <pre className="whitespace-pre-wrap">{
                                typeof log.output === 'object' 
                                  ? JSON.stringify(log.output, null, 2) 
                                  : log.output
                              }</pre>
                            </div>
                          </div>
                        )}
                        
                        {log.error && (
                          <div className="text-sm mt-2">
                            <p className="font-medium text-xs text-destructive mb-1">Error:</p>
                            <div className="bg-destructive/10 text-destructive rounded p-2 text-xs">
                              {log.error}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No execution logs found for this strategy</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StrategyBuilder;
