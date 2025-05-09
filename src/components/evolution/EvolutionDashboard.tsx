
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import AuditLog from './AuditLog';
import { AuditLog as AuditLogType } from '@/types/shared';

interface EvolutionDashboardProps {
  loading?: boolean;
}

const EvolutionDashboard: React.FC<EvolutionDashboardProps> = ({ loading = false }) => {
  const [activeTab, setActiveTab] = useState('system-logs');
  const [isLoading, setIsLoading] = useState(loading);

  // Define proper type for mockLogs
  const mockLogs: AuditLogType[] = [
    {
      id: '1',
      module: 'strategy',
      event_type: 'create',
      description: 'New strategy created',
      tenant_id: 'tenant-1',
      created_at: new Date().toISOString(),
      metadata: { strategy_id: 'strat-123', name: 'Growth Strategy Q2' }
    },
    {
      id: '2',
      module: 'plugin',
      event_type: 'execute',
      description: 'Plugin executed successfully',
      tenant_id: 'tenant-1',
      user_id: 'user-1',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      metadata: { plugin_id: 'plugin-456', execution_time: 1.25 }
    },
    {
      id: '3',
      module: 'auth',
      event_type: 'login',
      description: 'User logged in',
      tenant_id: 'tenant-1',
      user_id: 'user-2',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      metadata: { method: 'email', device: 'mobile' }
    },
    {
      id: '4',
      module: 'system',
      event_type: 'error',
      description: 'Edge function failed',
      tenant_id: 'tenant-1',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      metadata: { function: 'updateKPIs', error: 'Timeout exceeded' }
    }
  ];

  // Use the handleRefresh function in the AuditLog component
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="system-logs">System Logs</TabsTrigger>
            <TabsTrigger value="agent-evolution">Agent Evolution</TabsTrigger>
            <TabsTrigger value="strategy-logs">Strategy Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="system-logs" className="m-0">
            <AuditLog
              logs={mockLogs}
              isLoading={isLoading}
              title="System Activity"
            />
          </TabsContent>

          <TabsContent value="agent-evolution" className="m-0">
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              Agent evolution tracking coming soon...
            </div>
          </TabsContent>

          <TabsContent value="strategy-logs" className="m-0">
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              Strategy logs tracking coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EvolutionDashboard;
