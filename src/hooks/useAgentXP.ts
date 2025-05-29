/* XP calculation hook */

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useAgentXP(agentId) {
  const [xp, setXp] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel('agent-xp-log')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agent_logs' },
        (payload) => {
          console.log('🧠 Agent XP Log:', payload);
          setXp((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId]);

  return xp;
}