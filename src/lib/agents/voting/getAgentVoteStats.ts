
import { supabase } from "@/integrations/supabase/client";
import { VoteStats } from "./types";

/**
 * Get vote statistics for an agent version
 * @param agentVersionId Agent version ID
 * @returns Vote statistics
 */
export async function getAgentVoteStats(agentVersionId: string): Promise<VoteStats> {
  try {
    const { data: agent, error } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes, xp')
      .eq('id', agentVersionId)
      .single();
      
    if (error) throw error;
    
    // Get recent comments
    const { data: recentComments, error: commentsError } = await supabase
      .from('agent_votes')
      .select('id, vote_type, comment, created_at')
      .eq('agent_version_id', agentVersionId)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (commentsError) {
      console.warn('Error fetching vote comments:', commentsError);
    }
    
    return {
      success: true,
      upvotes: agent.upvotes || 0,
      downvotes: agent.downvotes || 0,
      xp: agent.xp || 0,
      totalVotes: (agent.upvotes || 0) + (agent.downvotes || 0),
      ratio: agent.upvotes && (agent.upvotes + agent.downvotes) > 0 
        ? Math.round((agent.upvotes / (agent.upvotes + agent.downvotes)) * 100)
        : 0,
      recentComments: recentComments || []
    };
  } catch (error: any) {
    console.error('Error getting agent vote stats:', error);
    return {
      success: false,
      upvotes: 0,
      downvotes: 0,
      xp: 0,
      totalVotes: 0,
      ratio: 0,
      error: error.message,
      recentComments: []
    };
  }
}
