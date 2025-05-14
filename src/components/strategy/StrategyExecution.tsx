
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayIcon, AlertCircleIcon, CheckCircleIcon, ClockIcon, Loader2 } from 'lucide-react';
import { execute } from '@/lib/strategy/execute';
import { toast } from '@/components/ui/use-toast';
import { ExecuteStrategyInput } from '@/types/fixed';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/hooks/useAuth';

interface StrategyExecutionProps {
  strategyId: string;
  strategyTitle: string;
  onExecutionComplete?: (result: any) => void;
  onExecutionStart?: () => void;
  className?: string;
}

export const StrategyExecution: React.FC<StrategyExecutionProps> = ({
  strategyId,
  strategyTitle,
  onExecutionComplete,
  onExecutionStart,
  className
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecutionResult, setLastExecutionResult] = useState<any>(null);
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();

  const handleExecute = async () => {
    if (!currentWorkspace?.id || !user?.id) {
      toast({
        title: "Cannot Execute Strategy",
        description: "Missing workspace or user information",
        variant: "destructive"
      });
      return;
    }
    
    setIsExecuting(true);
    if (onExecutionStart) onExecutionStart();
    
    try {
      // Build execution input
      const input: ExecuteStrategyInput = {
        strategyId,
        tenantId: currentWorkspace.id,
        userId: user.id,
        params: {},
        options: {
          debug: false,
          timeout: 60000,
        }
      };
      
      // Execute strategy
      const result = await execute(input);
      
      // Store result
      setLastExecutionResult(result);
      
      // Notify parent
      if (onExecutionComplete) onExecutionComplete(result);
      
      // Show success toast if not already shown in execute function
      if (result.success) {
        toast({
          title: "Strategy Execution Complete",
          description: `Successfully executed ${strategyTitle}`,
        });
      }
    } catch (error: any) {
      console.error('Strategy execution error:', error);
      
      // Show error toast if not already shown in execute function
      toast({
        title: "Execution Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  const getStatusIcon = () => {
    if (isExecuting) {
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    }
    
    if (!lastExecutionResult) {
      return <ClockIcon className="h-5 w-5 text-muted-foreground" />;
    }
    
    return lastExecutionResult.success ? 
      <CheckCircleIcon className="h-5 w-5 text-green-500" /> : 
      <AlertCircleIcon className="h-5 w-5 text-red-500" />;
  };
  
  const getStatusText = () => {
    if (isExecuting) {
      return "Executing...";
    }
    
    if (!lastExecutionResult) {
      return "Not executed";
    }
    
    return lastExecutionResult.success ? 
      `Executed in ${lastExecutionResult.executionTime?.toFixed(2) || '?'} seconds` : 
      "Execution failed";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          <span>Strategy Execution</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Execute this strategy to process data and generate insights.
          </p>
          
          {lastExecutionResult && (
            <div className="rounded-md bg-muted p-4 mt-4">
              <div className="text-sm font-medium mb-2">Last Execution Result:</div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={lastExecutionResult.success ? "text-green-500" : "text-red-500"}>
                    {lastExecutionResult.status || (lastExecutionResult.success ? "Success" : "Failed")}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Execution Time:</span>
                  <span>{lastExecutionResult.executionTime?.toFixed(2) || '?'} seconds</span>
                </div>
                
                {lastExecutionResult.pluginsExecuted && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plugins Executed:</span>
                    <span>{lastExecutionResult.pluginsExecuted}</span>
                  </div>
                )}
                
                {lastExecutionResult.xpEarned && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">XP Earned:</span>
                    <span>{lastExecutionResult.xpEarned}</span>
                  </div>
                )}
                
                {lastExecutionResult.error && (
                  <div className="mt-2">
                    <span className="text-muted-foreground">Error:</span>
                    <div className="mt-1 text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded">
                      {lastExecutionResult.error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-muted-foreground">{getStatusText()}</span>
          <Button 
            onClick={handleExecute} 
            disabled={isExecuting}
            className="gap-2"
          >
            <PlayIcon className="h-4 w-4" />
            {isExecuting ? "Executing..." : "Execute Strategy"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
