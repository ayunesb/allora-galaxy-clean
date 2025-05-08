
import { supabase } from '@/lib/supabase';
import { VoteType } from '@/types/shared';
import { VoteResult } from './types';

/**
 * Cast a vote on an agent version
 * @param agentVersionId - ID of the agent version
 * @param voteType - Type of vote ('up' or 'down')
 * @param comment - Optional comment with the vote
 * @returns Vote result with updated counts
 */
export async function castVote(
  agentVersionId: string,
  voteType: VoteType,
  comment?: string
): Promise<VoteResult> {
  if (!agentVersionId) {
    return {
      success: false,
      error: 'Agent version ID is required',
      upvotes: 0,
      downvotes: 0
    };
  }

  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      return {
        success: false,
        error: 'User must be authenticated to vote',
        upvotes: 0,
        downvotes: 0
      };
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('agent_votes')
      .select('id, vote_type')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', user.id)
      .single();

    let voteId;
    let action: 'inserted' | 'updated' | 'deleted' = 'inserted';

    // If vote exists and is the same type, remove vote (toggle behavior)
    if (existingVote && existingVote.vote_type === voteType) {
      const { error } = await supabase
        .from('agent_votes')
        .delete()
        .eq('id', existingVote.id);
      
      if (error) throw new Error(`Error removing vote: ${error.message}`);
      action = 'deleted';
    }
    // If vote exists but different type, update it
    else if (existingVote) {
      const { data, error } = await supabase
        .from('agent_votes')
        .update({
          vote_type: voteType,
          comment: comment || null
        })
        .eq('id', existingVote.id)
        .select('id')
        .single();
      
      if (error) throw new Error(`Error updating vote: ${error.message}`);
      voteId = data?.id;
      action = 'updated';
    }
    // If no vote exists, create new one
    else {
      const { data, error } = await supabase
        .from('agent_votes')
        .insert({
          agent_version_id: agentVersionId,
          user_id: user.id,
          vote_type: voteType,
          comment: comment || null
        })
        .select('id')
        .single();
      
      if (error) throw new Error(`Error creating vote: ${error.message}`);
      voteId = data?.id;
    }

    // Update agent version vote counts
    await updateAgentVersionVoteCount(agentVersionId);

    // Get updated vote counts
    const { upvotes, downvotes } = await getVoteCounts(agentVersionId);

    let message = '';
    if (action === 'inserted') message = 'Vote recorded successfully';
    else if (action === 'updated') message = 'Vote updated successfully';
    else message = 'Vote removed successfully';

    return {
      success: true,
      voteId,
      upvotes,
      downvotes,
      message
    };

  } catch (err: any) {
    console.error('Error casting vote:', err);
    return {
      success: false,
      error: err.message || 'Error casting vote',
      upvotes: 0,
      downvotes: 0
    };
  }
}

/**
 * Update the upvotes/downvotes count on an agent version
 */
async function updateAgentVersionVoteCount(agentVersionId: string): Promise<void> {
  // Get vote counts
  const { upvotes, downvotes } = await getVoteCounts(agentVersionId);
  
  // Update agent version
  await supabase
    .from('agent_versions')
    .update({
      upvotes,
      downvotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', agentVersionId);
}

/**
 * Get current vote counts for an agent version
 */
async function getVoteCounts(agentVersionId: string): Promise<{upvotes: number, downvotes: number}> {
  const { data } = await supabase
    .from('agent_votes')
    .select('vote_type')
    .eq('agent_version_id', agentVersionId);
  
  const counts = { 
    upvotes: 0, 
    downvotes: 0 
  };
  
  if (data) {
    data.forEach(vote => {
      if (vote.vote_type === 'up') counts.upvotes++;
      else if (vote.vote_type === 'down') counts.downvotes++;
    });
  }
  
  return counts;
}

// Export the wrapper functions for convenience
export const upvoteAgentVersion = (agentVersionId: string, comment?: string) => 
  castVote(agentVersionId, 'up', comment);

export const downvoteAgentVersion = (agentVersionId: string, comment?: string) => 
  castVote(agentVersionId, 'down', comment);
