
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CalendarIcon, Clock, Diff, Eye, FileText, History, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export const StrategyEvolutionTab = () => {
  const { currentTenant } = useWorkspace();
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [selectedExecution, setSelectedExecution] = useState<any>(null);
  const [strategyDetails, setStrategyDetails] = useState<any>(null);

  // Fetch strategies for dropdown
  const { data: strategies } = useQuery({
    queryKey: ['strategies', currentTenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select('id, title')
        .eq('tenant_id', currentTenant?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id
  });

  // Fetch strategy executions
  const { data: executions, isLoading: loadingExecutions } = useQuery({
    queryKey: ['strategyExecutions', currentTenant?.id, selectedStrategy],
    queryFn: async () => {
      if (!selectedStrategy) return [];

      const { data, error } = await supabase
        .from('executions')
        .select(`
          id, 
          status, 
          created_at, 
          execution_time, 
          xp_earned,
          profiles:executed_by (id, first_name, last_name)
        `)
        .eq('tenant_id', currentTenant?.id)
        .eq('strategy_id', selectedStrategy)
        .eq('type', 'strategy')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTenant?.id && !!selectedStrategy
  });

  // Fetch selected strategy details
  const { data: strategy } = useQuery({
    queryKey: ['strategyDetails', selectedStrategy],
    queryFn: async () => {
      if (!selectedStrategy) return null;

      const { data, error } = await supabase
        .from('strategies')
        .select(`
          id, 
          title, 
          description, 
          status, 
          priority,
          created_at,
          updated_at,
          completion_percentage,
          tags,
          profiles:created_by (id, first_name, last_name)
        `)
        .eq('id', selectedStrategy)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedStrategy
  });

  const handleViewDetails = (execution: any) => {
    setSelectedExecution(execution);
  };

  const handleViewStrategy = (strategy: any) => {
    setStrategyDetails(strategy);
  };

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'failure':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Strategy Evolution History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Strategy</label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a strategy to view its history" />
                </SelectTrigger>
                <SelectContent>
                  {strategies?.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      {strategy.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStrategy && strategy && (
              <div className="p-4 border rounded-lg bg-muted/50 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{strategy.title}</h3>
                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleViewStrategy(strategy)}>
                    <Eye className="h-4 w-4 mr-1" /> View Details
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 items-center text-sm">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(strategy.status)}`}>
                    {strategy.status}
                  </div>
                  {strategy.priority && (
                    <Badge variant="outline" className="font-normal">
                      {strategy.priority}
                    </Badge>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                    <span>{format(new Date(strategy.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  {strategy.tags && strategy.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      {strategy.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="font-normal text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedStrategy ? (
              loadingExecutions ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading execution history...</p>
                </div>
              ) : executions && executions.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Execution Time</TableHead>
                        <TableHead>XP Earned</TableHead>
                        <TableHead>Executed By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {executions.map((execution) => (
                        <TableRow key={execution.id}>
                          <TableCell className="font-mono text-xs">
                            {format(new Date(execution.created_at), 'yyyy-MM-dd HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(execution.status)}`}>
                              {execution.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {execution.execution_time ? `${execution.execution_time.toFixed(2)}s` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {execution.xp_earned || 0} XP
                          </TableCell>
                          <TableCell>
                            {execution.profiles ? (
                              `${execution.profiles.first_name || ''} ${execution.profiles.last_name || ''}`.trim() || 'Unknown'
                            ) : (
                              'System'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleViewDetails(execution)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center border rounded-md">
                  <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No executions found for this strategy.</p>
                </div>
              )
            ) : (
              <div className="py-8 text-center border rounded-md">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Select a strategy to view its execution history.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Execution Details Dialog */}
      <Dialog open={!!selectedExecution} onOpenChange={(open) => !open && setSelectedExecution(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Execution Details</DialogTitle>
          </DialogHeader>
          
          {selectedExecution && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Date</div>
                  <div className="font-mono text-sm">
                    {format(new Date(selectedExecution.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedExecution.status)}`}>
                      {selectedExecution.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Duration</div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {selectedExecution.execution_time ? `${selectedExecution.execution_time.toFixed(2)}s` : 'N/A'}
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="output">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="output">Output</TabsTrigger>
                  <TabsTrigger value="input">Input</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="output">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Execution Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-80">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {JSON.stringify(selectedExecution.output || {}, null, 2)}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="input">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Execution Input</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-80">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {JSON.stringify(selectedExecution.input || {}, null, 2)}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="logs">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Execution Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-80">
                        <div className="text-muted-foreground text-center p-4">
                          Detailed logs coming soon.
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Strategy Details Dialog */}
      <Dialog open={!!strategyDetails} onOpenChange={(open) => !open && setStrategyDetails(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Strategy Details</DialogTitle>
          </DialogHeader>
          
          {strategyDetails && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold">{strategyDetails.title}</h3>
                <p className="text-muted-foreground mt-1">{strategyDetails.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(strategyDetails.status)}`}>
                      {strategyDetails.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Created</div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {format(new Date(strategyDetails.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Completion</div>
                  <div>{strategyDetails.completion_percentage || 0}%</div>
                </div>
              </div>
              
              {strategyDetails.tags && strategyDetails.tags.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {strategyDetails.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Evolution History</div>
                <div className="text-center text-muted-foreground py-4">
                  <Diff className="h-8 w-8 mx-auto mb-2" />
                  <p>Version history coming soon.</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
