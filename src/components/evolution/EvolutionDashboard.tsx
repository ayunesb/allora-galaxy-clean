
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentEvolutionTab } from './AgentEvolutionTab';
import { StrategyEvolutionTab } from './StrategyEvolutionTab';
import { PluginEvolutionTab } from './PluginEvolutionTab';
import { AuditLog } from './AuditLog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { notify } from '@/lib/notifications/toast';
import type { SystemLog } from '@/types/logs';

export const EvolutionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch system logs for the audit log
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['system-logs', 'evolution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) {
        throw new Error(`Error fetching logs: ${error.message}`);
      }
      
      return data as SystemLog[];
    },
    onError: (error) => {
      notify({ 
        title: 'Error loading logs', 
        description: error instanceof Error ? error.message : 'Unknown error'
      }, { type: 'error' });
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Filter logs by module for each tab
  const strategyLogs = logs.filter(log => log.module === 'strategy');
  const agentLogs = logs.filter(log => log.module === 'agent');
  const pluginLogs = logs.filter(log => log.module === 'plugin');
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Evolution Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="plugins">Plugins</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <p className="text-muted-foreground">
                The Evolution Dashboard provides insights into how your strategies, agents, and plugins are evolving over time.
                View performance metrics, history logs, and track changes to the system.
              </p>
              
              <AuditLog logs={logs} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="strategies" className="space-y-6">
              <StrategyEvolutionTab />
              <AuditLog logs={strategyLogs} isLoading={isLoading} title="Strategy Audit Log" />
            </TabsContent>
            
            <TabsContent value="agents" className="space-y-6">
              <AgentEvolutionTab />
              <AuditLog logs={agentLogs} isLoading={isLoading} title="Agent Audit Log" />
            </TabsContent>
            
            <TabsContent value="plugins" className="space-y-6">
              <PluginEvolutionTab />
              <AuditLog logs={pluginLogs} isLoading={isLoading} title="Plugin Audit Log" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvolutionDashboard;
