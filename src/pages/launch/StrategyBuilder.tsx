import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Strategy, PluginLog } from '@/types';
import { runStrategy } from '@/lib/strategy/runStrategy';
import { AlertCircle, CheckCircle, Clock, Play, RefreshCw, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ExecuteStrategyResult } from '@/types/strategy';
import { PluginLogItem } from '@/components/plugins/PluginLogItem';
import { StrategyStatusBadge } from '@/components/strategy/StrategyStatusBadge';
import { StrategyMetadata } from '@/components/strategy/StrategyMetadata';
import { StrategyDescription } from '@/components/strategy/StrategyDescription';
import { StrategyActions } from '@/components/strategy/StrategyActions';
import { StrategyTags } from '@/components/strategy/StrategyTags';
import { StrategyHeader } from '@/components/strategy/StrategyHeader';

export default function StrategyBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useWorkspace();
  const { toast } = useToast();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecuteStrategyResult | null>(null);
  const [pluginLogs, setPluginLogs] = useState<PluginLog[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (id && currentTenant?.id) {
      fetchStrategy();
      fetchPluginLogs();
    }
  }, [id, currentTenant?.id]);

  const fetchStrategy = async () => {
    if (!id || !currentTenant?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', currentTenant.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setStrategy(data as Strategy);
      }
    } catch (error: any) {
      console.error('Error fetching strategy:', error);
      toast({
        title: 'Error',
        description: `Failed to load strategy: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPluginLogs = async () => {
    if (!id || !currentTenant?.id) return;

    try {
      setIsLoadingLogs(true);
      const { data, error } = await supabase
        .from('plugin_logs')
        .select('*')
        .eq('strategy_id', id)
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPluginLogs(data as PluginLog[]);
    } catch (error: any) {
      console.error('Error fetching plugin logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleExecuteStrategy = async () => {
    if (!id || !currentTenant?.id || !strategy) return;

    try {
      setIsExecuting(true);
      setExecutionResult(null);

      const result = await runStrategy({
        strategyId: id,
        tenantId: currentTenant.id,
      });

      setExecutionResult(result);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Strategy executed successfully',
        });
        // Refresh strategy and logs after execution
        fetchStrategy();
        fetchPluginLogs();
      } else {
        toast({
          title: 'Execution Failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error executing strategy:', error);
      toast({
        title: 'Error',
        description: `Failed to execute strategy: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getExecutionStatusIcon = () => {
    if (!executionResult) return null;

    if (executionResult.success) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Not Found</CardTitle>
            <CardDescription>
              The strategy you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/strategies')}>Back to Strategies</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <StrategyHeader 
        title={strategy.title}
        status={strategy.status}
        onBack={() => navigate('/strategies')}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">{strategy.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Created {strategy.created_at ? format(new Date(strategy.created_at), 'MMM d, yyyy') : 'Recently'}
                  </CardDescription>
                </div>
                <StrategyStatusBadge status={strategy.status} />
              </div>
            </CardHeader>
            <CardContent>
              <StrategyDescription description={strategy.description} />
              
              {strategy.tags && strategy.tags.length > 0 && (
                <div className="mt-4">
                  <StrategyTags tags={strategy.tags} />
                </div>
              )}
              
              {strategy.completion_percentage !== undefined && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion</span>
                    <span>{strategy.completion_percentage ?? 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${strategy.completion_percentage ?? 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <StrategyActions 
                strategyId={strategy.id}
                status={strategy.status}
                isExecuting={isExecuting}
                onExecute={handleExecuteStrategy}
              />
            </CardFooter>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="execution">Execution Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <StrategyMetadata strategy={strategy} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="execution" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Execution History</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchPluginLogs}
                      disabled={isLoadingLogs}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {executionResult && (
                    <div className={`mb-4 p-4 rounded-md ${executionResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex items-center">
                        {getExecutionStatusIcon()}
                        <div className="ml-3">
                          <h3 className={`text-sm font-medium ${executionResult.success ? 'text-green-800' : 'text-red-800'}`}>
                            {executionResult.success ? 'Execution Successful' : 'Execution Failed'}
                          </h3>
                          <div className="mt-1 text-sm">
                            {executionResult.success ? (
                              <div className="text-green-700">
                                <p>Plugins executed: {executionResult.plugins_executed || 0}</p>
                                <p>Successful plugins: {executionResult.successful_plugins || 0}</p>
                                <p>XP earned: {executionResult.xp_earned || 0}</p>
                              </div>
                            ) : (
                              <p className="text-red-700">{executionResult.error || 'Unknown error'}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isLoadingLogs ? (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : pluginLogs.length > 0 ? (
                    <div className="space-y-4">
                      {pluginLogs.map((log) => (
                        <PluginLogItem key={log.id} log={log} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="mx-auto h-12 w-12 mb-3 opacity-30" />
                      <p>No execution logs found for this strategy.</p>
                      <p className="text-sm mt-1">Execute the strategy to see logs here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                onClick={handleExecuteStrategy} 
                disabled={isExecuting || strategy.status === 'completed'}
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Execute Strategy
                  </>
                )}
              </Button>
              
              <Button variant="outline" className="w-full" onClick={() => navigate(`/strategies/${id}/edit`)}>
                Edit Strategy
              </Button>
              
              <Button variant="outline" className="w-full" onClick={() => navigate(`/strategies/${id}/duplicate`)}>
                Duplicate
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Related Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="link" className="w-full justify-start p-0 h-auto" onClick={() => navigate('/plugins')}>
                View Available Plugins
              </Button>
              <Button variant="link" className="w-full justify-start p-0 h-auto" onClick={() => navigate('/galaxy')}>
                Explore Galaxy
              </Button>
            </CardContent>
          </Card>
          
          {strategy.status === 'completed' && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <CardTitle>Strategy Completed</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">
                  This strategy has been successfully completed.
                </p>
              </CardContent>
            </Card>
          )}
          
          {strategy.status === 'rejected' && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <CardTitle>Strategy Rejected</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">
                  This strategy has been rejected and cannot be executed.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
