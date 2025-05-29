```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

console.log('useStrategyExecution loaded');

export function useStrategyExecution(strategyId) {
  const [executions, setExecutions] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel('strategy-exec-log')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'strategy_logs' },
        (payload) => {
          console.log('🚀 Strategy execution log:', payload);
          setExecutions((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [strategyId]);

  return { executions };
}
```