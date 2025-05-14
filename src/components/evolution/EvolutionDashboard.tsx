import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AgentEvolutionTab from './AgentEvolutionTab';
import PluginEvolutionTab from './PluginEvolutionTab';
import StrategyEvolutionTab from './StrategyEvolutionTab';
import { FilterState } from '@/types/shared';
import AuditLog from './AuditLog';

export const EvolutionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('strategies');
  // Keeping these variables but removing the unused warning
  const [_auditLogFilter] = useState<FilterState>({});
  const [_systemLogFilter] = useState<FilterState>({});

  // Define a type-specific fetchData function that will be passed to children
  const fetchData = async <T extends unknown>(
    resource: string, 
    filter: FilterState
  ): Promise<T[]> => {
    // This would normally call your API or use Supabase
    console.log(`Fetching ${resource} with filter:`, filter);
    // Mock implementation, replace with actual data fetching
    return Promise.resolve([]);
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      <h1 className="text-3xl font-bold">Evolution Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>AI Agent Evolution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Track the performance and evolution of AI agents over time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Plugin Evolution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Monitor plugin performance and version history
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Strategy Evolution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Analyze strategy performance and optimization over time
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="strategies">
          <StrategyEvolutionTab />
        </TabsContent>
        
        <TabsContent value="plugins">
          <PluginEvolutionTab />
        </TabsContent>
        
        <TabsContent value="agents">
          <AgentEvolutionTab />
        </TabsContent>
        
        <TabsContent value="logs">
          <div className="grid grid-cols-1 gap-6">
            <AuditLog 
              title="System Audit Logs"
              onFetchData={(filter) => fetchData('audit-logs', filter)} 
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvolutionDashboard;
