
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStrategyEvolution } from './strategy/useStrategyEvolution';
import StrategyDetails from './strategy/StrategyDetails';
import EvolutionHistory from './strategy/EvolutionHistory';
import ExecutionLogs from './strategy/ExecutionLogs';
import StrategyLoadingSkeleton from './strategy/StrategyLoadingSkeleton';

interface StrategyEvolutionTabProps {
  strategyId: string;
}

const StrategyEvolutionTab: React.FC<StrategyEvolutionTabProps> = ({ strategyId }) => {
  const { loading, strategy, history, logs, userMap, formatDate } = useStrategyEvolution(strategyId);

  // Render user's name from ID
  const renderUser = (userId: string | undefined) => {
    if (!userId) return 'Unknown User';
    
    const user = userMap[userId];
    if (!user) return 'Unknown User';
    
    const initials = [user.first_name?.[0] || '', user.last_name?.[0] || ''].join('').toUpperCase();
    
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span>{user.first_name} {user.last_name}</span>
      </div>
    );
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'success':
        variant = "default"; // blue
        break;
      case 'pending':
      case 'in_progress':
        variant = "secondary"; // purple
        break;
      case 'rejected':
      case 'failed':
      case 'error':
        variant = "destructive"; // red
        break;
      default:
        variant = "outline"; // neutral
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  // Render loading state
  if (loading) {
    return <StrategyLoadingSkeleton />;
  }

  // Render no data state
  if (!strategy) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Strategy not found or you don't have permission to view it.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Strategy Details */}
      <StrategyDetails 
        strategy={strategy}
        loading={loading}
        renderUser={renderUser}
        renderStatusBadge={renderStatusBadge}
        formatDate={formatDate}
      />
      
      {/* Evolution History */}
      <EvolutionHistory 
        history={history}
        formatDate={formatDate}
        renderUser={renderUser}
        renderStatusBadge={renderStatusBadge}
      />
      
      {/* Execution Logs */}
      <ExecutionLogs 
        logs={logs}
        formatDate={formatDate}
        renderUser={renderUser}
        renderStatusBadge={renderStatusBadge}
      />
    </div>
  );
};

export default StrategyEvolutionTab;
