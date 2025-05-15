
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
import { StrategyDetails } from './strategy/StrategyDetails';
import { EvolutionHistory } from './strategy/EvolutionHistory';
import { ExecutionLogs } from './strategy/ExecutionLogs';
import { StrategyLoadingSkeleton } from './strategy/StrategyLoadingSkeleton';
import type { Strategy, StrategyVersion, StrategyExecution } from '@/types/strategy';

interface StrategyEvolutionTabProps {
  strategyId?: string;
}

const StrategyEvolutionTab: React.FC<StrategyEvolutionTabProps> = ({ 
  strategyId = 'default' 
}) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(strategyId);
  
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
            data={strategy.data}
            isLoading={isLoading || strategy.isLoading}
            error={error || strategy.error}
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
                strategy={strategyData} 
                formatDate={formatDate}
                userMap={userMap}
              />
            )}
          </AsyncDataRenderer>
        </TabsContent>
        
        <TabsContent value="evolution">
          <AsyncDataRenderer 
            data={versions.data}
            isLoading={isLoading || versions.isLoading}
            error={error || versions.error}
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
                userMap={userMap}
              />
            )}
          </AsyncDataRenderer>
        </TabsContent>
        
        <TabsContent value="executions">
          <AsyncDataRenderer 
            data={executions.data}
            isLoading={isLoading || executions.isLoading}
            error={error || executions.error}
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
                logs={executionData}
                formatDate={formatDate}
                userMap={userMap}
              />
            )}
          </AsyncDataRenderer>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategyEvolutionTab;
