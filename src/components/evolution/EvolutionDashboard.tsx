
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentEvolutionTab } from './AgentEvolutionTab';
import { PluginEvolutionTab } from './PluginEvolutionTab';
import StrategyEvolutionTab from './StrategyEvolutionTab';
import AuditLog from './AuditLog';

const EvolutionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agents');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Evolution Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Track the evolution of your AI components and learn from their improvements
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Evolution Analytics</CardTitle>
          <CardDescription>
            View evolution patterns and performance improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="agents" value={activeTab} onValueChange={setActiveTab}>
            <div className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="plugins">Plugins</TabsTrigger>
                <TabsTrigger value="strategies">Strategies</TabsTrigger>
              </TabsList>
              
              <TabsContent value="agents" className="space-y-4">
                <AgentEvolutionTab />
              </TabsContent>
              
              <TabsContent value="plugins" className="space-y-4">
                <PluginEvolutionTab />
              </TabsContent>
              
              <TabsContent value="strategies" className="space-y-4">
                <StrategyEvolutionTab strategyId={''} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      <AuditLog />
    </div>
  );
};

export default EvolutionDashboard;
