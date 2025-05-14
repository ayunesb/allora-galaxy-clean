
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseFetch } from '@/hooks/useSupabaseFetch';
import { useToast } from '@/lib/notifications/toast';
import { useTenantId } from '@/hooks/useTenantId';
import StrategyEvolutionTab from './StrategyEvolutionTab';
import PluginEvolutionTab from './PluginEvolutionTab';
import AgentEvolutionTab from './AgentEvolutionTab';
import AuditLog from './AuditLog';

interface EvolutionDashboardProps {
  initialTab?: string;
}

const EvolutionDashboard: React.FC<EvolutionDashboardProps> = ({ initialTab = 'strategies' }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const { toast } = useToast();
  const tenantId = useTenantId();
  
  // Fetch audit logs for evolution activities
  const { data: auditLogs, isLoading: isLoadingLogs, refetch: refetchLogs } = useSupabaseFetch(
    'system_logs',
    {
      query: (query) => 
        query
          .select('*')
          .eq('tenant_id', tenantId)
          // Include evolution-related modules
          .in('module', ['strategy', 'agent', 'plugin'])
          // Include evolution-related events
          .in('event', ['evolution', 'create', 'update', 'approve', 'reject', 'vote'])
          .order('created_at', { ascending: false })
          .limit(100),
    }
  );

  const handleRefreshLogs = async () => {
    try {
      await refetchLogs();
      toast({
        title: "Logs refreshed",
      });
    } catch (error) {
      toast({
        title: "Could not refresh logs",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Evolution Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
        </TabsList>
        
        <TabsContent value="strategies" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Evolution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <StrategyEvolutionTab />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="agents" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Agent Evolution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <AgentEvolutionTab />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plugins" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Evolution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <PluginEvolutionTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <AuditLog 
          title="Evolution Activity Logs" 
          logs={auditLogs || []} 
          isLoading={isLoadingLogs} 
          onRefresh={handleRefreshLogs} 
        />
      </div>
    </div>
  );
};

export default EvolutionDashboard;
