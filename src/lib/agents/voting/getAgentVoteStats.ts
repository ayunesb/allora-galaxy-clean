
import { supabase } from '@/integrations/supabase/client';
import { AgentVoteStats } from './types';

/**
 * Get voting statistics for an agent version
 * @param agentVersionId The agent version ID
 * @returns The vote stats (upvotes, downvotes, total, ratio)
 */
export async function getAgentVoteStats(agentVersionId: string): Promise<AgentVoteStats> {
  try {
    const { data, error } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();

    if (error) {
      console.error('Error fetching agent vote stats:', error);
      return {
        upvotes: 0,
        downvotes: 0,
        total: 0,
        ratio: 0
      };
    }

    const upvotes = data?.upvotes || 0;
    const downvotes = data?.downvotes || 0;
    const total = upvotes + downvotes;
    const ratio = total > 0 ? upvotes / total : 0;

    return {
      upvotes,
      downvotes,
      total,
      ratio
    };
  } catch (err) {
    console.error('Unexpected error getting agent vote stats:', err);
    return {
      upvotes: 0,
      downvotes: 0,
      total: 0,
      ratio: 0
    };
  }
}
