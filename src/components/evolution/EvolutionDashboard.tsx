
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentEvolutionTab from './AgentEvolutionTab';
import PluginEvolutionTab from './PluginEvolutionTab';
import StrategyEvolutionTab from './StrategyEvolutionTab';
import { Card, CardContent } from '@/components/ui/card';
import { useSystemLogsData } from '@/hooks/admin/useSystemLogsData';
import { useAuditLogData } from '@/hooks/admin/useAuditLogData';
import { SystemLogFilter } from '@/types/shared';
import AuditLog from './AuditLog';

const EvolutionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('strategy');
  
  // Setup filters for system logs
  const [systemLogFilter, setSystemLogFilter] = useState<SystemLogFilter>({
    module: 'agent',
    searchTerm: '',
  });
  
  // Get audit logs
  const { 
    data: auditLogs, 
    isLoading: auditLogsLoading, 
    refresh: refreshAuditLogs 
  } = useAuditLogData();
  
  // Get agent evolution logs
  const {
    data: evolutionLogs,
    isLoading: evolutionLogsLoading, 
    refresh: refreshEvolutionLogs
  } = useSystemLogsData({
    ...systemLogFilter,
    event: 'evolution',
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Evolution Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Evolution Performance</h2>
            {/* Performance metrics visualization would go here */}
            <div className="h-64 bg-muted/20 rounded flex items-center justify-center">
              Evolution performance visualization placeholder
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Evolution Stats</h2>
            <div className="space-y-4">
              <div>
                <span className="text-muted-foreground">Agents Evolved</span>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div>
                <span className="text-muted-foreground">Plugins Optimized</span>
                <p className="text-2xl font-bold">18</p>
              </div>
              <div>
                <span className="text-muted-foreground">Strategies Improved</span>
                <p className="text-2xl font-bold">7</p>
              </div>
              <div>
                <span className="text-muted-foreground">Performance Gain</span>
                <p className="text-2xl font-bold text-green-500">+12.4%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strategy">Strategies</TabsTrigger>
          <TabsTrigger value="agent">Agents</TabsTrigger>
          <TabsTrigger value="plugin">Plugins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="strategy" className="mt-6">
          <StrategyEvolutionTab />
        </TabsContent>
        
        <TabsContent value="agent" className="mt-6">
          <AgentEvolutionTab />
        </TabsContent>
        
        <TabsContent value="plugin" className="mt-6">
          <PluginEvolutionTab />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Evolution Activity</h2>
        <AuditLog
          logs={auditLogs} 
          isLoading={auditLogsLoading}
          onRefresh={refreshAuditLogs}
        />
      </div>
    </div>
  );
};

export default EvolutionDashboard;
