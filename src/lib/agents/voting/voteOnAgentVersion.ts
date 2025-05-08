
import { supabase } from '@/integrations/supabase/client';
import { VoteType } from '@/types/shared';
import { UserVoteInfo, VoteResult } from './types';

/**
 * Get the current user's vote for an agent version
 * @param agentVersionId The agent version ID
 * @returns The user's vote information
 */
export async function getUserVote(agentVersionId: string): Promise<UserVoteInfo> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { hasVoted: false, vote: null };
    }
    
    // Check if the user has already voted on this agent version
    const { data, error } = await supabase
      .from('agent_votes')
      .select('vote_type, comment')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', user.id)
      .single();
    
    if (error || !data) {
      // No vote found
      return { hasVoted: false, vote: null };
    }
    
    // Map vote_type to VoteType enum
    let voteType: VoteType;
    if (data.vote_type === 'upvote' || data.vote_type === 'up') {
      voteType = 'upvote';
    } else if (data.vote_type === 'downvote' || data.vote_type === 'down') {
      voteType = 'downvote';
    } else {
      voteType = 'neutral';
    }
    
    return {
      hasVoted: true,
      vote: {
        voteType,
        comment: data.comment
      }
    };
    
  } catch (err) {
    console.error('Error getting user vote:', err);
    return { hasVoted: false, vote: null };
  }
}

/**
 * Vote on an agent version
 * @param agentVersionId The agent version ID
 * @param voteType The type of vote (upvote, downvote, neutral)
 * @param comment Optional comment with the vote
 * @returns Result of the voting operation
 */
export async function voteOnAgentVersion(
  agentVersionId: string,
  voteType: VoteType,
  comment?: string
): Promise<VoteResult> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'User must be logged in to vote',
        upvotes: 0,
        downvotes: 0
      };
    }
    
    // Start a transaction to ensure data consistency
    const { data: currentVote } = await supabase
      .from('agent_votes')
      .select('vote_type')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', user.id)
      .single();
      
    let updateType: 'insert' | 'update' | 'remove' = 'insert';
    
    if (currentVote) {
      // User already voted
      if (voteType === 'upvote' && currentVote.vote_type === 'upvote') {
        updateType = 'remove'; // Toggle off upvote
      } else if (voteType === 'downvote' && currentVote.vote_type === 'downvote') {
        updateType = 'remove'; // Toggle off downvote
      } else {
        updateType = 'update'; // Change vote
      }
    }
    
    if (updateType === 'insert') {
      // Insert new vote
      const { error } = await supabase
        .from('agent_votes')
        .insert({
          agent_version_id: agentVersionId,
          user_id: user.id,
          vote_type: voteType,
          comment
        });
      
      if (error) throw error;
      
      // Update agent version vote counts
      await updateAgentVersionVoteCounts(agentVersionId, voteType === 'upvote' ? 1 : 0, voteType === 'downvote' ? 1 : 0);
    } else if (updateType === 'update') {
      // Update existing vote
      const { error } = await supabase
        .from('agent_votes')
        .update({
          vote_type: voteType,
          comment
        })
        .eq('agent_version_id', agentVersionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update agent version vote counts
      let upvoteDiff = 0;
      let downvoteDiff = 0;
      
      if (voteType === 'upvote' && currentVote.vote_type === 'downvote') {
        upvoteDiff = 1;
        downvoteDiff = -1;
      } else if (voteType === 'downvote' && currentVote.vote_type === 'upvote') {
        upvoteDiff = -1;
        downvoteDiff = 1;
      }
      
      await updateAgentVersionVoteCounts(agentVersionId, upvoteDiff, downvoteDiff);
    } else {
      // Remove vote
      const { error } = await supabase
        .from('agent_votes')
        .delete()
        .eq('agent_version_id', agentVersionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update agent version vote counts
      await updateAgentVersionVoteCounts(
        agentVersionId,
        currentVote.vote_type === 'upvote' ? -1 : 0,
        currentVote.vote_type === 'downvote' ? -1 : 0
      );
    }
    
    // Get the updated vote counts
    const { data, error } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Vote recorded successfully',
      upvotes: data.upvotes || 0,
      downvotes: data.downvotes || 0
    };
    
  } catch (err: any) {
    console.error('Error voting on agent version:', err);
    return {
      success: false,
      error: err.message || 'Failed to record vote',
      upvotes: 0,
      downvotes: 0
    };
  }
}

/**
 * Helper function to update the upvote and downvote counts for an agent version
 */
async function updateAgentVersionVoteCounts(
  agentVersionId: string,
  upvoteDiff: number,
  downvoteDiff: number
): Promise<void> {
  if (upvoteDiff === 0 && downvoteDiff === 0) return;
  
  try {
    const { error } = await supabase.rpc('update_agent_version_votes', {
      agent_version_id: agentVersionId,
      upvote_diff: upvoteDiff,
      downvote_diff: downvoteDiff
    });
    
    if (error) {
      console.error('Error updating vote counts:', error);
      // Fallback to direct update if RPC fails
      if (upvoteDiff !== 0) {
        await supabase
          .from('agent_versions')
          .update({
            upvotes: supabase.rpc('increment', { inc: upvoteDiff })
          })
          .eq('id', agentVersionId);
      }
      
      if (downvoteDiff !== 0) {
        await supabase
          .from('agent_versions')
          .update({
            downvotes: supabase.rpc('increment', { inc: downvoteDiff })
          })
          .eq('id', agentVersionId);
      }
    }
  } catch (err) {
    console.error('Failed to update agent version vote counts:', err);
  }
}

/**
 * Convenience function to upvote an agent version
 */
export async function upvoteAgentVersion(
  agentVersionId: string,
  comment?: string
): Promise<VoteResult> {
  return voteOnAgentVersion(agentVersionId, 'upvote', comment);
}

/**
 * Convenience function to downvote an agent version
 */
export async function downvoteAgentVersion(
  agentVersionId: string,
  comment?: string
): Promise<VoteResult> {
  return voteOnAgentVersion(agentVersionId, 'downvote', comment);
}

/**
 * Cast a vote on an agent version
 * @param agentVersionId The agent version ID
 * @param voteType The type of vote
 * @param comment Optional comment with the vote
 * @returns Result of the voting operation
 */
export const castVote = voteOnAgentVersion;
