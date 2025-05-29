import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export function useAgentEvolution(agent_id: string) {
  return useQuery(['agentVotes', agent_id], async () => {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('*')
      .eq('agent_id', agent_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  });
}