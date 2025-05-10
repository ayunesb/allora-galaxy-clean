
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import AuditLog from './AuditLog';
import AgentEvolutionTab from './AgentEvolutionTab';
import PluginEvolutionTab from './PluginEvolutionTab';
import StrategyEvolutionTab from './StrategyEvolutionTab';
import { Skeleton } from '@/components/ui/skeleton';
import useAuditLogData from '@/hooks/admin/useAuditLogData';

const EvolutionDashboard = () => {
  const { type } = useParams<{ type?: string }>();
  const navigate = useNavigate();
  const { logs, isLoading, handleRefresh } = useAuditLogData();
  const [activeTab, setActiveTab] = useState('logs');
  const { currentWorkspace } = useWorkspace();
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('default');

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    if (value !== 'logs') {
      if (type !== value) {
        navigate(`/evolution/${value}`);
      }
    } else {
      navigate('/evolution');
    }
  };

  // If a type is provided in the URL, set it as the active tab
  useEffect(() => {
    if (type) {
      setActiveTab(type);
    }
  }, [type]);

  // If no workspace is selected, show a loading state
  if (!currentWorkspace) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-64" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Evolution Dashboard</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="agent">Agent Evolution</TabsTrigger>
          <TabsTrigger value="plugin">Plugin Evolution</TabsTrigger>
          <TabsTrigger value="strategy">Strategy Evolution</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <AuditLog 
            title="System Activity Logs" 
            onRefresh={handleRefresh}
            isLoading={isLoading}
            data={logs}
          />
        </TabsContent>

        <TabsContent value="agent">
          <AgentEvolutionTab />
        </TabsContent>

        <TabsContent value="plugin">
          <PluginEvolutionTab />
        </TabsContent>

        <TabsContent value="strategy">
          <StrategyEvolutionTab strategyId={selectedStrategyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvolutionDashboard;
