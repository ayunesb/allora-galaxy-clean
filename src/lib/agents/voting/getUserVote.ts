
import { supabase } from '@/integrations/supabase/client';
import { VoteType } from '@/types/shared';

/**
 * Get a user's vote on an agent version
 * @param agentVersionId The agent version ID
 * @param userId The user ID
 * @returns Object containing vote information
 */
export async function getUserVote(agentVersionId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('vote_type, comment')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No vote found for this user
        return { 
          hasVoted: false, 
          vote: null 
        };
      }
      throw error;
    }
    
    return {
      hasVoted: true,
      vote: {
        voteType: data.vote_type as VoteType,
        comment: data.comment
      }
    };
  } catch (error) {
    console.error('Error fetching user vote:', error);
    return {
      hasVoted: false,
      vote: null
    };
  }
}
