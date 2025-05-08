
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentEvolutionTab } from './AgentEvolutionTab';
import StrategyEvolutionTab from './StrategyEvolutionTab';
import { PluginEvolutionTab } from './PluginEvolutionTab';
import { Card } from '@/components/ui/card';
import AuditLog from './AuditLog';

export const EvolutionDashboard = () => {
  // State for strategy ID (used when viewing a specific strategy)
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  
  const handleSelectStrategy = (id: string) => {
    setSelectedStrategyId(id);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Evolution Dashboard</h1>
      
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Agent Evolution</TabsTrigger>
          <TabsTrigger value="plugins">Plugin Evolution</TabsTrigger>
          <TabsTrigger value="strategies">Strategy Evolution</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agents" className="space-y-4">
          <AgentEvolutionTab />
        </TabsContent>
        
        <TabsContent value="plugins" className="space-y-4">
          <PluginEvolutionTab />
        </TabsContent>
        
        <TabsContent value="strategies" className="space-y-4">
          {selectedStrategyId ? (
            <StrategyEvolutionTab strategyId={selectedStrategyId} />
          ) : (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                Select a strategy to view its evolution history
              </p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-4">
          <AuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvolutionDashboard;
