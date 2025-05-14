
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StrategyEvolutionTab from './StrategyEvolutionTab';
import AgentEvolutionTab from './AgentEvolutionTab';
import PluginEvolutionTab from './PluginEvolutionTab';
import AuditLog from './AuditLog';
import { useQuery } from '@tanstack/react-query';
import { SystemLog } from '@/types/logs';

// Import from the system lib
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Generate some mock logs for the example
const generateMockLogs = (count: number): SystemLog[] => {
  const modules = ['system', 'auth', 'api', 'database', 'strategy'];
  const levels = ['info', 'warning', 'error'] as const;
  
  return Array.from({ length: count }).map((_, i) => {
    const now = new Date();
    const randomDate = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const module = modules[Math.floor(Math.random() * modules.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    return {
      id: `log-${i}`,
      created_at: randomDate.toISOString(),
      description: `Example ${level} log message for ${module}`,
      level,
      module,
      event: `${module}.${level === 'error' ? 'exception' : level}`,
      metadata: { source: 'mock' },
      context: JSON.stringify({ page: 'evolution' })
    };
  });
};

const EvolutionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('strategies');
  
  // Mock fetching logs with React Query
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['evolution-logs'],
    queryFn: async () => {
      // Log this action using the system logger
      await logSystemEvent(
        'evolution',
        'info',
        {
          description: 'Fetched evolution logs',
          log_count: 10
        }
      );
      // Return mock data
      return generateMockLogs(10);
    }
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
