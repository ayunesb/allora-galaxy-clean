
import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StrategyEvolutionTab from './StrategyEvolutionTab';
import AgentEvolutionTab from './AgentEvolutionTab';
import PluginEvolutionTab from './PluginEvolutionTab';
import AuditLog from './AuditLog';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';

export const EvolutionDashboard = () => {
  const [activeTab, setActiveTab] = useState('strategy');
  const { fetchLogs } = useSystemLogsData();

  // Memoize the fetch function to avoid recreating it on every render
  const fetchFilteredLogs = useMemo(() => {
    return async (filters: any) => {
      return fetchLogs(filters);
    };
  }, [fetchLogs]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evolution Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage changes to strategies, agents, and plugins
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="strategy">Strategy Evolution</TabsTrigger>
            <TabsTrigger value="agent">Agent Evolution</TabsTrigger>
            <TabsTrigger value="plugin">Plugin Evolution</TabsTrigger>
            <TabsTrigger value="audit">System Activity</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="strategy" className="space-y-6">
          <StrategyEvolutionTab />
        </TabsContent>

        <TabsContent value="agent" className="space-y-6">
          <AgentEvolutionTab />
        </TabsContent>

        <TabsContent value="plugin" className="space-y-6">
          <PluginEvolutionTab />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>
                Complete audit trail of system events and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLog onFetchData={fetchFilteredLogs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvolutionDashboard;
