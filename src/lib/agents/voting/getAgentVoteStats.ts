
import { supabase } from "@/integrations/supabase/client";
import { AgentVoteStats } from "./types";

/**
 * Get vote statistics for an agent version
 * @param agentVersionId Agent version ID
 * @returns Vote statistics
 */
export async function getAgentVoteStats(agentVersionId: string): Promise<AgentVoteStats> {
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
    
    const upvotes = agent.upvotes || 0;
    const downvotes = agent.downvotes || 0;
    const totalVotes = upvotes + downvotes;
    const ratio = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;
    
    return {
      agentVersionId,
      upvotes,
      downvotes,
      xp: agent.xp || 0,
      totalVotes,
      ratio,
      recentComments: recentComments || []
    };
  } catch (error: any) {
    console.error('Error getting agent vote stats:', error);
    return {
      agentVersionId,
      upvotes: 0,
      downvotes: 0,
      xp: 0,
      totalVotes: 0
    };
  }
}
