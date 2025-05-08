import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Strategy } from '@/types/strategy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StrategyEvolutionTabProps {
  strategyId: string;
}

const StrategyEvolutionTab: React.FC<StrategyEvolutionTabProps> = ({ strategyId }) => {
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchStrategyEvolution = async () => {
      setLoading(true);
      
      try {
        // Fetch strategy details
        const { data: strategyData, error: strategyError } = await supabase
          .from('strategies')
          .select('*')
          .eq('id', strategyId)
          .single();
          
        if (strategyError) throw strategyError;
        
        // Fetch strategy history (system logs related to this strategy)
        const { data: historyData, error: historyError } = await supabase
          .from('system_logs')
          .select('*')
          .eq('module', 'strategy')
          .filter('context->strategy_id', 'eq', strategyId)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (historyError) throw historyError;
        
        // Fetch execution logs for this strategy
        const { data: logsData, error: logsError } = await supabase
          .from('plugin_logs')
          .select('*')
          .eq('strategy_id', strategyId)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (logsError) throw logsError;
        
        setStrategy(strategyData);
        setHistory(historyData || []);
        setLogs(logsData || []);
        
        // Collect user IDs that need to be fetched
        const userIds = new Set<string>();
        if (strategyData?.created_by) userIds.add(strategyData.created_by);
        if (strategyData?.approved_by) userIds.add(strategyData.approved_by);
        
        historyData?.forEach(item => {
          if (item.context?.user_id) userIds.add(item.context.user_id);
          if (item.context?.executed_by) userIds.add(item.context.executed_by);
          if (item.context?.approved_by) userIds.add(item.context.approved_by);
        });
        
        logsData?.forEach(log => {
          if (log.executed_by) userIds.add(log.executed_by);
        });
        
        // Fetch user data if we have IDs to fetch
        if (userIds.size > 0) {
          const userIdArray = Array.from(userIds);
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url')
            .in('id', userIdArray);
            
          if (!userError && userData) {
            const users = userData.reduce((acc: Record<string, any>, user) => {
              acc[user.id] = user;
              return acc;
            }, {});
            setUserMap(users);
          }
        }
      } catch (error) {
        console.error('Error fetching strategy evolution data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (strategyId) {
      fetchStrategyEvolution();
    }
  }, [strategyId]);

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

  // Format the timestamp
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
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
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-8 w-2/3" /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-1/3" /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <div>Strategy: {strategy.title}</div>
            <div>{renderStatusBadge(strategy.status)}</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-lg">{strategy.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Created by</p>
              <div className="pt-1">
                {strategy.created_by ? renderUser(strategy.created_by) : 'System'}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Created at</p>
              <p>{formatDate(strategy.created_at)}</p>
            </div>
            
            {strategy.approved_by && (
              <div>
                <p className="text-sm text-muted-foreground">Approved by</p>
                <div className="pt-1">
                  {renderUser(strategy.approved_by)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Evolution History */}
      <Card>
        <CardHeader>
          <CardTitle>Evolution History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No evolution history found for this strategy.</p>
          ) : (
            <div className="space-y-4">
              {history.map((event) => {
                const userId = event.context?.user_id || event.context?.executed_by;
                
                return (
                  <div key={event.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                    <div className="w-32 shrink-0">
                      {formatDate(event.created_at)}
                    </div>
                    
                    <div className="flex-grow">
                      <p className="font-medium">
                        {event.event.replace(/_/g, ' ')}
                      </p>
                      
                      {userId && (
                        <div className="text-sm text-muted-foreground">
                          by {renderUser(userId)}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      {event.context?.status && renderStatusBadge(event.context.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No execution logs found for this strategy.</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <div className="w-32 shrink-0">
                    {formatDate(log.created_at)}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {log.plugin_id ? 'Plugin Execution' : 'Strategy Execution'}
                      </p>
                      {renderStatusBadge(log.status)}
                    </div>
                    
                    {log.executed_by && (
                      <div className="text-sm text-muted-foreground">
                        by {renderUser(log.executed_by)}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Button variant="ghost" size="icon" title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyEvolutionTab;
