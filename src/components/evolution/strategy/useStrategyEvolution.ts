
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Strategy } from '@/types/strategy';
import { format } from 'date-fns';

export function useStrategyEvolution(strategyId: string) {
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

  // Format the timestamp
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  return {
    loading,
    strategy,
    history,
    logs,
    userMap,
    formatDate
  };
}
