import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export function useAIDiff(agent_id: string) {
  return useQuery(['agentVersionDiff', agent_id], async () => {
    const { data, error } = await supabase
      .from('agent_versions')
      .select('id, agent_id, prompt, version, created_at')
      .eq('agent_id', agent_id)
      .order('version', { ascending: true });
    if (error) throw error;
    return data;
  });
}