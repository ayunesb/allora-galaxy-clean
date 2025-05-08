
import { supabase } from '@/integrations/supabase/client';
import { VoteType } from '@/types/shared';
import { UserVote, VoteResult, UserVoteInfo } from './types';

interface UpdateVoteCountsParams {
  agentVersionId: string;
  increment: 'upvotes' | 'downvotes';
  decrement?: 'upvotes' | 'downvotes';
}

/**
 * Updates the vote counts for an agent version
 * @private
 */
async function updateVoteCounts({ agentVersionId, increment, decrement }: UpdateVoteCountsParams): Promise<void> {
  // Base update object
  const updates: Record<string, any> = { 
    [increment]: supabase.rpc('increment_counter', { row_id: agentVersionId, counter_name: increment })
  };
  
  // If we're also decrementing a different counter (switching votes)
  if (decrement) {
    updates[decrement] = supabase.rpc('decrement_counter', { row_id: agentVersionId, counter_name: decrement });
  }
  
  // Update the agent version
  const { error } = await supabase
    .from('agent_versions')
    .update(updates)
    .eq('id', agentVersionId);
  
  if (error) {
    console.error('Error updating vote counts:', error);
    throw new Error(`Failed to update vote counts: ${error.message}`);
  }
}

/**
 * Retrieves user's current vote for an agent version
 * @public
 */
export async function getUserVote(agentVersionId: string): Promise<UserVoteInfo> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user) {
    return { hasVoted: false, vote: null };
  }
  
  const userId = session.session.user.id;
  
  // Get the user's current vote if it exists
  const { data, error } = await supabase
    .from('agent_votes')
    .select('vote_type, comment')
    .eq('agent_version_id', agentVersionId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching user vote:', error);
    return { hasVoted: false, vote: null };
  }
  
  if (!data) {
    return { hasVoted: false, vote: null };
  }
  
  return {
    hasVoted: true,
    vote: {
      voteType: data.vote_type as VoteType,
      comment: data.comment
    }
  };
}

/**
 * Casts a vote for an agent version
 * @public
 */
export async function castVote(
  agentVersionId: string, 
  voteType: VoteType,
  comment?: string
): Promise<VoteResult> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user) {
    return {
      success: false,
      error: 'You must be logged in to vote',
      upvotes: 0,
      downvotes: 0
    };
  }
  
  const userId = session.session.user.id;
  
  try {
    // Get the user's current vote if it exists
    const { vote: currentVote, hasVoted } = await getUserVote(agentVersionId);
    
    // If the user is voting the same way, return early
    if (hasVoted && currentVote && currentVote.voteType === voteType) {
      // Fetch current vote counts
      const { data: agentVersion } = await supabase
        .from('agent_versions')
        .select('upvotes, downvotes')
        .eq('id', agentVersionId)
        .single();
        
      return {
        success: true,
        message: `You've already voted ${voteType === 'upvote' ? 'up' : 'down'}`,
        upvotes: agentVersion?.upvotes || 0,
        downvotes: agentVersion?.downvotes || 0
      };
    }
    
    // Determine which counters to update
    let updateParams: UpdateVoteCountsParams;
    
    if (hasVoted && currentVote) {
      // User is changing their vote
      if (currentVote.voteType === 'upvote' && voteType === 'downvote') {
        updateParams = { agentVersionId, increment: 'downvotes', decrement: 'upvotes' };
      } else {
        updateParams = { agentVersionId, increment: 'upvotes', decrement: 'downvotes' };
      }
      
      // Update the user's vote
      await supabase
        .from('agent_votes')
        .update({ vote_type: voteType, comment: comment || currentVote.comment })
        .eq('agent_version_id', agentVersionId)
        .eq('user_id', userId);
    } else {
      // New vote
      updateParams = { 
        agentVersionId, 
        increment: voteType === 'upvote' ? 'upvotes' : 'downvotes'
      };
      
      // Insert the new vote
      await supabase
        .from('agent_votes')
        .insert({
          agent_version_id: agentVersionId,
          user_id: userId,
          vote_type: voteType,
          comment: comment || null
        });
    }
    
    // Update the vote counts
    await updateVoteCounts(updateParams);
    
    // Fetch the updated vote counts
    const { data: updatedAgent } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();
    
    return {
      success: true,
      message: `Vote ${hasVoted ? 'changed' : 'cast'} successfully!`,
      upvotes: updatedAgent?.upvotes || 0,
      downvotes: updatedAgent?.downvotes || 0
    };
  } catch (error: any) {
    console.error('Error casting vote:', error);
    return {
      success: false,
      error: `Failed to cast vote: ${error.message}`,
      upvotes: 0,
      downvotes: 0
    };
  }
}

/**
 * Upvote an agent version
 * @public
 */
export async function upvoteAgentVersion(agentVersionId: string, comment?: string): Promise<VoteResult> {
  return castVote(agentVersionId, 'upvote', comment);
}

/**
 * Downvote an agent version
 * @public
 */
export async function downvoteAgentVersion(agentVersionId: string, comment?: string): Promise<VoteResult> {
  return castVote(agentVersionId, 'downvote', comment);
}
