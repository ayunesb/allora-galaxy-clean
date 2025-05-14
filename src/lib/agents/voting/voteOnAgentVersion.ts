
import { supabase } from '@/lib/supabase';
import { VoteType } from '@/types/shared';

/**
 * Cast a vote on an agent version
 * @param agentVersionId The agent version ID
 * @param voteType The vote type (up, down, or neutral)
 * @param comment Optional comment on the vote
 * @returns Promise with the vote result
 */
export async function voteOnAgentVersion(
  agentVersionId: string,
  voteType: VoteType,
  comment?: string
): Promise<{ 
  success: boolean;
  upvotes?: number; 
  downvotes?: number;
  voteId?: string;
  error?: string;
}> {
  try {
    // Check if user already voted for this agent version
    const { data: existingVote } = await supabase
      .from('agent_votes')
      .select('id, vote_type')
      .eq('agent_version_id', agentVersionId)
      .single();

    let result;
    
    if (existingVote) {
      // Update existing vote
      if (existingVote.vote_type === voteType) {
        // If clicking same vote, remove it (toggle off)
        result = await supabase
          .from('agent_votes')
          .delete()
          .eq('id', existingVote.id);
      } else {
        // Change vote
        result = await supabase
          .from('agent_votes')
          .update({ 
            vote_type: voteType,
            comment: comment || null
          })
          .eq('id', existingVote.id);
      }
    } else {
      // Create new vote
      result = await supabase
        .from('agent_votes')
        .insert({ 
          agent_version_id: agentVersionId, 
          vote_type: voteType,
          comment: comment || null 
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    // Get updated vote counts
    const { data: updatedVersion, error: countError } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();
      
    if (countError) throw countError;

    return {
      success: true,
      upvotes: updatedVersion.upvotes,
      downvotes: updatedVersion.downvotes,
      voteId: result.data?.id
    };
  } catch (error: any) {
    console.error('Error voting on agent version:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get the current user's vote for an agent version
 * @param agentVersionId The agent version ID
 * @returns Promise with the user vote info
 */
export async function getUserVote(agentVersionId: string): Promise<{
  success: boolean;
  hasVoted: boolean;
  vote: any | null;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('agent_votes')
      .select('*')
      .eq('agent_version_id', agentVersionId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is code for "no rows returned", which is normal if user hasn't voted
      throw error;
    }

    return {
      success: true,
      hasVoted: !!data,
      vote: data
    };
  } catch (error: any) {
    console.error('Error getting user vote:', error);
    return { success: false, hasVoted: false, vote: null, error: error.message };
  }
}

/**
 * Upvote an agent version
 * @param agentVersionId The agent version ID
 * @param comment Optional comment on the upvote
 * @returns Promise with the vote result
 */
export async function upvoteAgentVersion(
  agentVersionId: string, 
  comment?: string
): Promise<{ success: boolean; error?: string; }> {
  return voteOnAgentVersion(agentVersionId, VoteType.Up, comment);
}

/**
 * Downvote an agent version
 * @param agentVersionId The agent version ID
 * @param comment Optional comment on the downvote
 * @returns Promise with the vote result
 */
export async function downvoteAgentVersion(
  agentVersionId: string,
  comment?: string
): Promise<{ success: boolean; error?: string; }> {
  return voteOnAgentVersion(agentVersionId, VoteType.Down, comment);
}

/**
 * Cast a vote on an agent version with comment
 * @param agentVersionId The agent version ID
 * @param voteType The vote type
 * @param comment The comment on the vote
 * @returns Promise with the vote result 
 */
export async function castVote(
  agentVersionId: string,
  voteType: VoteType,
  comment?: string
): Promise<{ success: boolean; error?: string; }> {
  return voteOnAgentVersion(agentVersionId, voteType, comment);
}
