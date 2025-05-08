import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { runStrategy, RunStrategyInput } from '@/lib/strategy/runStrategy';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface Strategy {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at?: string;
  created_by?: string;
  tenant_id?: string;
  tags?: string[];
}

const StrategyEngine: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tenantId } = useWorkspace();
  
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  
  useEffect(() => {
    fetchStrategy();
  }, [id]);
  
  const fetchStrategy = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setStrategy(data);
      await logSystemEvent('strategy', 'info', {
        action: 'view_strategy',
        strategy_id: id
      }, tenantId);
    } catch (err: any) {
      console.error('Error fetching strategy:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to load strategy: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExecuteStrategy = async () => {
    if (!strategy || !tenantId) return;
    
    try {
      setIsExecuting(true);
      setError(null);
      setExecutionResult(null);
      
      const input: RunStrategyInput = {
        strategyId: strategy.id,
        tenantId,
        options: {
          timeout: 60000, // 1 minute timeout
        }
      };
      
      const result = await runStrategy(input);
      
      setExecutionResult(result);
      
      if (result.success) {
        toast({
          title: 'Strategy Executed',
          description: 'The strategy was executed successfully',
          variant: 'default',
        });
      } else {
        setError(result.error || 'Execution failed');
        toast({
          title: 'Execution Failed',
          description: result.error || 'Failed to execute strategy',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Strategy execution error:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: `Execution error: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!strategy) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Strategy Not Found</AlertTitle>
        <AlertDescription>
          The requested strategy could not be found or you don't have permission to view it.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="container px-4 py-6 mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{strategy.title}</h1>
        <p className="text-muted-foreground mt-2">{strategy.description}</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Rocket className="h-5 w-5 mr-2" />
            Execute Strategy
          </CardTitle>
          <CardDescription>
            Launch this strategy to execute all associated plugins and generate results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded-full bg-blue-500"></div>
              <div>Status: <span className="font-medium capitalize">{strategy.status}</span></div>
            </div>
            
            {strategy.tags && strategy.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {strategy.tags.map((tag, i) => (
                  <div key={i} className="px-2 py-1 bg-muted rounded text-xs">
                    {tag}
                  </div>
                ))}
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {executionResult && executionResult.success && (
              <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle>Strategy Executed Successfully</AlertTitle>
                <AlertDescription>
                  <div>Execution ID: {executionResult.execution_id}</div>
                  <div>Execution Time: {executionResult.execution_time} seconds</div>
                  <div>Plugins Executed: {executionResult.plugins_executed}</div>
                  <div>XP Earned: {executionResult.xp_earned}</div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button 
            onClick={handleExecuteStrategy} 
            disabled={isExecuting || strategy.status !== 'approved'} 
            className="flex items-center"
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Execute Strategy
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Additional sections for execution history, plugins, etc. would go here */}
      
    </div>
  );
};

export default StrategyEngine;
