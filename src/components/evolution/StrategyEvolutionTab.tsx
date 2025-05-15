
import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useStrategyEvolution } from './strategy/useStrategyEvolution';
import { AsyncDataRenderer } from '@/components/ui/async-data-renderer';
import StrategyDetails from './strategy/StrategyDetails';
import EvolutionHistory from './strategy/EvolutionHistory';
import ExecutionLogs from './strategy/ExecutionLogs';
import StrategyLoadingSkeleton from './strategy/StrategyLoadingSkeleton';
import type { Strategy, StrategyVersion, StrategyExecution } from '@/types/strategy';

interface StrategyEvolutionTabProps {
  strategyId?: string;
}

const StrategyEvolutionTab: React.FC<StrategyEvolutionTabProps> = ({ 
  strategyId = 'default' 
}) => {
  const [selectedStrategyId] = useState<string>(strategyId);
  
  const { 
    strategy,
    versions,
    executions,
    isLoading, 
    error, 
    refetch 
  } = useStrategyEvolution(selectedStrategyId);

  // Format date helper
  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  // Extract user data for display
  const getUserName = (userId: string | null) => {
    if (!userId) return 'System';
    // In a real app, map userId to actual name from users data
    return userId.substring(0, 8) + '...';
  };

  // Create a user map for easier reference
  const userMap = {
    getUserName,
  };

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Strategy Details</TabsTrigger>
          <TabsTrigger value="evolution">Evolution History</TabsTrigger>
          <TabsTrigger value="executions">Execution Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <AsyncDataRenderer 
            data={strategy}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            loadingComponent={<StrategyLoadingSkeleton />}
            emptyComponent={
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No strategy data available</p>
              </Card>
            }
          >
            {(strategyData: Strategy) => (
              <StrategyDetails 
                strategyId={strategyData.id} 
              />
            )}
          </AsyncDataRenderer>
        </TabsContent>
        
        <TabsContent value="evolution">
          <AsyncDataRenderer 
            data={versions}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            loadingComponent={<StrategyLoadingSkeleton />}
            emptyComponent={
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No evolution history available</p>
              </Card>
            }
          >
            {(historyData: StrategyVersion[]) => (
              <EvolutionHistory 
                history={historyData}
                formatDate={formatDate}
                renderUser={getUserName}
              />
            )}
          </AsyncDataRenderer>
        </TabsContent>
        
        <TabsContent value="executions">
          <AsyncDataRenderer 
            data={executions}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            loadingComponent={<StrategyLoadingSkeleton />}
            emptyComponent={
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No execution logs available</p>
              </Card>
            }
          >
            {(executionData: StrategyExecution[]) => (
              <ExecutionLogs 
                executions={executionData}
                formatDate={formatDate}
                renderUser={getUserName}
              />
            )}
          </AsyncDataRenderer>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategyEvolutionTab;
