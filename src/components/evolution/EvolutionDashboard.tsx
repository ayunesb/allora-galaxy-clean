
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AgentEvolutionTab from './AgentEvolutionTab';
import PluginEvolutionTab from './PluginEvolutionTab';
import StrategyEvolutionTab from './StrategyEvolutionTab';
import AuditLog from './AuditLog';
import { AuditLogFilter, SystemLogFilter } from '@/types/shared';

export function EvolutionDashboard() {
  // State for tracking active tab
  const [activeTab, setActiveTab] = useState("audit-log");
  
  // State for filters
  const [auditLogFilter, setAuditLogFilter] = useState<AuditLogFilter>({});
  const [systemLogFilter, setSystemLogFilter] = useState<SystemLogFilter>({});
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Fetch audit logs - would connect to a real API in production
  const fetchAuditLogs = async () => {
    // Implementation would go here
    console.log("Fetching audit logs");
  };
  
  // Handle refresh for audit logs
  const handleRefreshAuditLogs = () => {
    console.log("Refreshing audit logs");
    // This would trigger a real refresh in production
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Galaxy Evolution Center</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Evolution Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold">Agents</h3>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">3 evolved this month</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold">Plugins</h3>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">1 evolved this month</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold">Strategies</h3>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">2 new versions this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="audit-log">Audit Log</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="audit-log">
          <AuditLog onRefresh={handleRefreshAuditLogs} />
        </TabsContent>
        
        <TabsContent value="agents">
          <AgentEvolutionTab />
        </TabsContent>
        
        <TabsContent value="plugins">
          <PluginEvolutionTab />
        </TabsContent>
        
        <TabsContent value="strategies">
          <StrategyEvolutionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EvolutionDashboard;
