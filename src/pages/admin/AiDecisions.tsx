import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AdminGuard } from '@/components/guards/AdminGuard';
import PromptDiffViewer from '@/components/PromptDiffViewer';

interface AiDecision {
  id: string;
  strategy_id: string;
  plugin_id: string;
  agent_version_id: string;
  decision_type: string;
  prompt: string;
  reasoning: string;
  created_at: string;
  executed_by?: string;
  output?: any;
}

const AiDecisions: React.FC = () => {
  const [decisions, setDecisions] = useState<AiDecision[]>([]);
  const [activeTab, setActiveTab] = useState<string>('strategy');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<string>('');
  const [plugins, setPlugins] = useState<{id: string, name: string}[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<AiDecision | null>(null);
  
  const tenantId = useTenantId();
  const { toast } = useToast();
  
  // Load plugins for the filter dropdown
  const loadPlugins = async () => {
    if (!tenantId) return;
    
    try {
      const { data, error } = await supabase
        .from('plugins')
        .select('id, name')
        .eq('tenant_id', tenantId);
      
      if (error) throw error;
      setPlugins(data || []);
    } catch (err: any) {
      console.error('Error loading plugins:', err);
    }
  };
  
  const loadAiDecisions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      // This is a placeholder - in a real implementation, there would be a dedicated
      // ai_decisions table. For now, we're using executions with filters.
      let query = supabase
        .from('executions')
        .select(`
          id,
          strategy_id,
          plugin_id,
          agent_version_id,
          type as decision_type,
          input:input->prompt,
          output:output->reasoning,
          created_at,
          executed_by,
          output
        `)
        .eq('tenant_id', tenantId)
        .eq('type', activeTab)
        .order('created_at', { ascending: false });
        
      if (selectedPlugin) {
        query = query.eq('plugin_id', selectedPlugin);
      }
      
      const { data, error: decisionsError } = await query.limit(50);
      
      if (decisionsError) throw decisionsError;
      setDecisions(data as unknown as AiDecision[] || []);
      
    } catch (err: any) {
      console.error('Error loading AI decisions:', err);
      setError(err.message);
      toast({
        title: 'Error loading AI decisions',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (tenantId) {
      loadPlugins();
      loadAiDecisions();
    }
  }, [tenantId, activeTab, selectedPlugin]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const getDecisionTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'strategy':
        return <Badge className="bg-blue-500">Strategy</Badge>;
      case 'plugin':
        return <Badge className="bg-purple-500">Plugin</Badge>;
      case 'agent':
        return <Badge className="bg-yellow-500">Agent</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };
  
  const handlePromptClick = (decision: AiDecision) => {
    setSelectedPrompt(decision);
  };
  
  const clearPromptSelection = () => {
    setSelectedPrompt(null);
  };
  
  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <Card className={selectedPrompt ? 'hidden md:block' : 'block'}>
          <CardHeader>
            <CardTitle>AI Decisions</CardTitle>
            <CardDescription>
              Review AI decision history, reasoning, and prompts used across the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="strategy">Strategy Decisions</TabsTrigger>
                  <TabsTrigger value="plugin">Plugin Decisions</TabsTrigger>
                  <TabsTrigger value="agent">Agent Decisions</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-full sm:w-auto">
                  <Select value={selectedPlugin} onValueChange={setSelectedPlugin}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by plugin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All plugins</SelectItem>
                      {plugins.map(plugin => (
                        <SelectItem key={plugin.id} value={plugin.id}>
                          {plugin.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" onClick={() => setSelectedPlugin('')}>
                  Clear filter
                </Button>
                
                <Button variant="outline" onClick={loadAiDecisions}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Prompt</TableHead>
                    <TableHead>Reasoning</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex justify-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                        </div>
                        <p className="mt-2 text-gray-500">Loading decisions...</p>
                      </TableCell>
                    </TableRow>
                  ) : decisions.length ? (
                    decisions.map((decision) => (
                      <TableRow key={decision.id}>
                        <TableCell className="font-mono text-xs">
                          {formatDate(decision.created_at)}
                        </TableCell>
                        <TableCell>
                          {getDecisionTypeBadge(decision.decision_type)}
                        </TableCell>
                        <TableCell>
                          <div className="max-h-20 overflow-y-auto text-xs">
                            {decision.prompt ? (
                              decision.prompt.substring(0, 100) + 
                              (decision.prompt.length > 100 ? '...' : '')
                            ) : (
                              <span className="text-gray-500 italic">No prompt data</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-h-20 overflow-y-auto text-xs">
                            {decision.reasoning ? (
                              decision.reasoning.substring(0, 100) + 
                              (decision.reasoning.length > 100 ? '...' : '')
                            ) : (
                              <span className="text-gray-500 italic">No reasoning data</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePromptClick(decision)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-gray-500">No AI decisions found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try changing filters or run AI operations to generate decisions
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {selectedPrompt && (
          <Card className="mt-6 md:mt-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Decision Details</CardTitle>
                <CardDescription>
                  AI decision information and prompt analysis
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={clearPromptSelection}>
                Back to List
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Decision ID</h3>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">{selectedPrompt.id}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Prompt</h3>
                  <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">{selectedPrompt.prompt}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Reasoning</h3>
                  <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">{selectedPrompt.reasoning}</pre>
                  </div>
                </div>
                
                {selectedPrompt.output && (
                  <div>
                    <h3 className="font-medium mb-2">Complete Output</h3>
                    <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(selectedPrompt.output, null, 2)}</pre>
                    </div>
                  </div>
                )}
                
                {/* Add PromptDiffViewer integration if there are two prompts to compare */}
                {/* <PromptDiffViewer oldPrompt={...} newPrompt={...} /> */}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminGuard>
  );
};

export default AiDecisions;
