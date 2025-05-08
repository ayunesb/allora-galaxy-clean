
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, GitBranch, Puzzle, FileText } from 'lucide-react';

import { AgentEvolutionTab } from './AgentEvolutionTab';
import { PluginEvolutionTab } from './PluginEvolutionTab';
import { StrategyEvolutionTab } from './StrategyEvolutionTab';
import { AuditLog } from './AuditLog';

export const EvolutionDashboard = () => {
  const [activeTab, setActiveTab] = useState('agents');

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evolution Dashboard</h1>
        <p className="text-muted-foreground">
          Track and manage the evolution of agents, plugins, and strategies over time
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>AI Evolution Insights</CardTitle>
          <CardDescription>
            Monitor how AI components evolve, audit changes, and rollback when necessary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-4 flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Version History</h3>
                <p className="text-sm text-muted-foreground">
                  Track every version of AI components
                </p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Evolution Tree</h3>
                <p className="text-sm text-muted-foreground">
                  View how components evolve and branch
                </p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Puzzle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">XP Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Measure performance and improvements
                </p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Audit Trail</h3>
                <p className="text-sm text-muted-foreground">
                  SOC2-style compliance and transparency
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agents">
          <AgentEvolutionTab />
        </TabsContent>
        
        <TabsContent value="plugins">
          <PluginEvolutionTab />
        </TabsContent>
        
        <TabsContent value="strategies">
          <StrategyEvolutionTab />
        </TabsContent>
        
        <TabsContent value="audit">
          <AuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};
