
import { supabase } from '@/integrations/supabase/client';
import { AgentVoteStats } from '@/types/agent';

/**
 * Get vote statistics for an agent version
 * @param agentVersionId The agent version ID
 * @returns Object with upvotes and downvotes counts
 */
export async function getAgentVoteStats(agentVersionId: string): Promise<AgentVoteStats> {
  try {
    // Fetch the agent version to get the upvotes and downvotes
    const { data, error } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();
    
    if (error) {
      throw new Error(`Failed to fetch agent vote stats: ${error.message}`);
    }
    
    return {
      upvotes: data?.upvotes || 0,
      downvotes: data?.downvotes || 0
    };
  } catch (error: any) {
    console.error('Error getting agent vote stats:', error);
    // Return default values in case of error
    return {
      upvotes: 0,
      downvotes: 0
    };
  }
}

export default getAgentVoteStats;
