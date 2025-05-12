
import { supabase } from '@/integrations/supabase/client';
import { VoteType } from '@/types/shared';

/**
 * Updates the vote counts for an agent version
 * @param agentVersionId - The agent version ID
 * @param voteType - The type of vote (upvote or downvote)
 * @param isAdd - Whether to add or remove the vote
 */
export async function updateVoteCounts(
  agentVersionId: string,
  voteType: VoteType,
  isAdd: boolean
) {
  try {
    const field = voteType === 'upvote' ? 'upvotes' : 'downvotes';
    const increment = isAdd ? 1 : -1;

    const { error } = await supabase
      .from('agent_versions')
      .update({ [field]: supabase.rpc('increment', { inc: increment, row_id: agentVersionId, column_name: field }) })
      .eq('id', agentVersionId);

    if (error) {
      console.error(`Error updating ${voteType} count:`, error);
    }
  } catch (error) {
    console.error('Exception updating vote counts:', error);
  }
}

/**
 * Formats vote statistics for display
 * @param upvotes - Number of upvotes
 * @param downvotes - Number of downvotes
 */
export function formatVoteStats(upvotes: number, downvotes: number) {
  const total = upvotes + downvotes;
  const ratio = total > 0 ? (upvotes / total) * 100 : 0;

  return {
    total,
    ratio: Math.round(ratio),
  };
}

/**
 * Get user vote for an agent version
 * @param userId - User ID
 * @param agentVersionId - Agent version ID
 */
export async function getUserVote(userId: string, agentVersionId: string) {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('id, vote_type, comment')
      .eq('user_id', userId)
      .eq('agent_version_id', agentVersionId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error checking user vote:', error);
    return null;
  }
}
