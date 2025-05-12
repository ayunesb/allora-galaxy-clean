
import { supabase } from '@/integrations/supabase/client';
import { VoteType } from '@/types/shared';
import { UserVoteInfo } from '@/types/agent';

/**
 * Get the user's vote for a specific agent version
 * @param userId The user ID
 * @param agentVersionId The agent version ID
 * @returns Object with vote information
 */
export async function getUserVote(userId: string, agentVersionId: string): Promise<UserVoteInfo> {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('vote_type, comment')
      .eq('user_id', userId)
      .eq('agent_version_id', agentVersionId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No vote found - this is not an error
        return {
          success: true,
          hasVoted: false,
          vote: null
        };
      }
      
      throw error;
    }
    
    // Map DB vote type to application vote type
    const voteType: VoteType = data.vote_type === 'up' ? 'upvote' : 'downvote';
    
    return {
      success: true,
      hasVoted: true,
      vote: {
        voteType,
        comment: data.comment
      }
    };
  } catch (error: any) {
    console.error('Error getting user vote:', error);
    return {
      success: false,
      hasVoted: false,
      vote: null,
      error: error.message
    };
  }
}

export default getUserVote;
