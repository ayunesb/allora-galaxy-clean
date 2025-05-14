
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StrategyEvolutionTab from './StrategyEvolutionTab';
import AgentEvolutionTab from './AgentEvolutionTab';
import PluginEvolutionTab from './PluginEvolutionTab';
import AuditLog from './AuditLog';
import { useQuery } from '@tanstack/react-query';

// Import from the admin system logs utility instead
import { fetchSystemLogs } from '@/lib/admin/systemLogs';

const EvolutionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('strategies');
  
  // Define proper query function
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['system-logs'],
    queryFn: () => fetchSystemLogs()
  });
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">System Evolution Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="audit-log">Audit Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="strategies" className="space-y-4">
          <StrategyEvolutionTab />
        </TabsContent>
        
        <TabsContent value="agents" className="space-y-4">
          <AgentEvolutionTab />
        </TabsContent>
        
        <TabsContent value="plugins" className="space-y-4">
          <PluginEvolutionTab />
        </TabsContent>
        
        <TabsContent value="audit-log" className="space-y-4">
          <AuditLog logs={logsData || []} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvolutionDashboard;
