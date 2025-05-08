
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowUpRight, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const StrategyEvolutionTab = () => {
  const { currentTenant } = useWorkspace();
  const tenantId = currentTenant?.id;
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  
  // Fetch strategies
  const { data: strategies, isLoading } = useQuery({
    queryKey: ['strategies', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('strategies')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          updated_at,
          tags,
          completion_percentage
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching strategies:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!tenantId
  });
  
  // Fetch strategy executions for the selected strategy
  const { data: executions, isLoading: isExecutionsLoading } = useQuery({
    queryKey: ['strategyExecutions', selectedStrategyId],
    queryFn: async () => {
      if (!selectedStrategyId) return [];
      
      const { data, error } = await supabase
        .from('executions')
        .select('*')
        .eq('strategy_id', selectedStrategyId)
        .eq('type', 'strategy')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching strategy executions:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!selectedStrategyId
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Strategy Evolution</CardTitle>
            <CardDescription>
              Track how strategies evolve over time
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            {strategies && strategies.length > 0 ? (
              <div className="space-y-4">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="border rounded-md">
                    <div 
                      className={`p-4 ${selectedStrategyId === strategy.id ? 'bg-muted/50' : ''}`} 
                      onClick={() => setSelectedStrategyId(strategy.id === selectedStrategyId ? null : strategy.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{strategy.title}</h3>
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(strategy.status)}
                            >
                              {strategy.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {strategy.description}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="font-medium">{strategy.completion_percentage || 0}%</span>
                          <span className="text-muted-foreground ml-1">complete</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(strategy.updated_at || strategy.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      
                      {strategy.tags && strategy.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {strategy.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No strategies found</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>
              {selectedStrategyId 
                ? strategies?.find(s => s.id === selectedStrategyId)?.title || 'Strategy Details'
                : 'Strategy Details'}
            </CardTitle>
            <CardDescription>
              {selectedStrategyId 
                ? 'Execution history and metrics'
                : 'Select a strategy to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStrategyId ? (
              <div>
                <h3 className="font-medium mb-2">Execution History</h3>
                <div className="max-h-[400px] overflow-y-auto">
                  {isExecutionsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : executions && executions.length > 0 ? (
                    <div className="space-y-3">
                      {executions.map((execution) => (
                        <div key={execution.id} className="border p-3 rounded-md">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              {execution.status === 'success' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : execution.status === 'partial' ? (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                  Partial
                                </Badge>
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-sm font-medium">
                                {execution.status === 'success' 
                                  ? 'Successful execution'
                                  : execution.status === 'partial'
                                  ? 'Partial success'
                                  : 'Failed execution'}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(execution.created_at), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <div className="font-medium">Execution time</div>
                              <div>{execution.execution_time}s</div>
                            </div>
                            <div>
                              <div className="font-medium">XP earned</div>
                              <div>{execution.xp_earned || 0}</div>
                            </div>
                            <div>
                              <div className="font-medium">Plugins</div>
                              <div>
                                {execution.output?.plugins_executed || 0} executed, 
                                {execution.output?.successful_plugins || 0} successful
                              </div>
                            </div>
                          </div>
                          
                          {execution.error && (
                            <div className="mt-2 text-xs text-red-500">
                              <div className="font-medium">Error</div>
                              <div>{execution.error}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-muted-foreground">No execution history found</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] border rounded-md p-6 text-center">
                <ArrowUpRight className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No strategy selected</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Select a strategy from the list to see details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
