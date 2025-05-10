
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StrategyDetails from './strategy/StrategyDetails';
import EvolutionHistory from './strategy/EvolutionHistory';
import ExecutionLogs from './strategy/ExecutionLogs';
import StrategyLoadingSkeleton from './strategy/StrategyLoadingSkeleton';
import { useStrategyEvolution } from './strategy/useStrategyEvolution';

interface StrategyEvolutionTabProps {
  strategyId?: string;
}

const StrategyEvolutionTab: React.FC<StrategyEvolutionTabProps> = ({ strategyId = 'default' }) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(strategyId);
  const { loading, strategy, history, logs, userMap, formatDate, error } = useStrategyEvolution(selectedStrategyId);

  const { data: strategies, isLoading: loadingStrategies } = useQuery({
    queryKey: ['strategies-for-evolution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select('id, title, status')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
  });

  // Helper to render user info
  const renderUser = (userId: string | undefined) => {
    if (!userId) return 'Unknown User';
    
    const user = userMap[userId];
    if (!user) return userId.slice(0, 8);
    
    return user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user.email || userId.slice(0, 8);
  };

  // Helper to render status badges
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Strategy Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedStrategyId} 
            onValueChange={setSelectedStrategyId}
            disabled={loadingStrategies}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a strategy" />
            </SelectTrigger>
            <SelectContent>
              {strategies?.map((strategy) => (
                <SelectItem key={strategy.id} value={strategy.id}>
                  {strategy.title} {renderStatusBadge(strategy.status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load strategy evolution data: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <StrategyLoadingSkeleton />
      ) : (
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">Evolution History</TabsTrigger>
            <TabsTrigger value="executions">Execution Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <StrategyDetails strategyId={selectedStrategyId} />
          </TabsContent>
          
          <TabsContent value="history">
            <EvolutionHistory 
              history={history} 
              renderUser={renderUser} 
              formatDate={formatDate} 
            />
          </TabsContent>
          
          <TabsContent value="executions">
            <ExecutionLogs 
              logs={logs}
              renderUser={renderUser}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default StrategyEvolutionTab;
