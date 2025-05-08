
import { supabase } from '@/lib/supabase';
import { VoteType } from '@/types/shared';
import { VoteResult } from './types';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Cast a vote on an agent version
 * 
 * @param agentVersionId The ID of the agent version
 * @param userId The ID of the user casting the vote
 * @param voteType The type of vote ('up' or 'down')
 * @param comment Optional comment with the vote
 * @returns Vote result including updated counts
 */
export async function castVote(
  agentVersionId: string,
  userId: string,
  voteType: VoteType,
  comment?: string
): Promise<VoteResult> {
  if (!agentVersionId || !userId) {
    return {
      success: false,
      error: 'Missing required parameters',
      upvotes: 0,
      downvotes: 0,
    };
  }

  try {
    // Check if the user has already voted on this agent version
    const { data: existingVote, error: existingVoteError } = await supabase
      .from('agent_votes')
      .select('id, vote_type')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', userId)
      .single();

    if (existingVoteError && existingVoteError.code !== 'PGRST116') {
      throw existingVoteError;
    }

    // Start a transaction to ensure consistent vote counts
    const transaction = async () => {
      if (existingVote) {
        // User has already voted, check if they're changing their vote
        if (existingVote.vote_type === voteType) {
          // User is voting the same way, treat as removing their vote
          await supabase
            .from('agent_votes')
            .delete()
            .eq('id', existingVote.id);

          // Decrement the corresponding vote count
          if (voteType === 'up') {
            await supabase
              .from('agent_versions')
              .update({ upvotes: supabase.rpc('decrement', { x: 1 }) })
              .eq('id', agentVersionId);
          } else {
            await supabase
              .from('agent_versions')
              .update({ downvotes: supabase.rpc('decrement', { x: 1 }) })
              .eq('id', agentVersionId);
          }

          return {
            success: true,
            message: `${voteType === 'up' ? 'Upvote' : 'Downvote'} removed`,
            voteId: null,
          };
        } else {
          // User is changing their vote
          await supabase
            .from('agent_votes')
            .update({
              vote_type: voteType,
              comment: comment,
            })
            .eq('id', existingVote.id);

          // Update vote counts
          if (voteType === 'up') {
            // Switching from down to up
            await supabase
              .from('agent_versions')
              .update({
                upvotes: supabase.rpc('increment', { x: 1 }),
                downvotes: supabase.rpc('decrement', { x: 1 }),
              })
              .eq('id', agentVersionId);
          } else {
            // Switching from up to down
            await supabase
              .from('agent_versions')
              .update({
                upvotes: supabase.rpc('decrement', { x: 1 }),
                downvotes: supabase.rpc('increment', { x: 1 }),
              })
              .eq('id', agentVersionId);
          }

          return {
            success: true,
            message: `Changed vote to ${voteType === 'up' ? 'upvote' : 'downvote'}`,
            voteId: existingVote.id,
          };
        }
      } else {
        // User hasn't voted yet, insert a new vote
        const { data: newVote, error: newVoteError } = await supabase
          .from('agent_votes')
          .insert({
            agent_version_id: agentVersionId,
            user_id: userId,
            vote_type: voteType,
            comment: comment,
          })
          .select('id')
          .single();

        if (newVoteError) throw newVoteError;

        // Increment the corresponding vote count
        if (voteType === 'up') {
          await supabase
            .from('agent_versions')
            .update({ upvotes: supabase.rpc('increment', { x: 1 }) })
            .eq('id', agentVersionId);
        } else {
          await supabase
            .from('agent_versions')
            .update({ downvotes: supabase.rpc('increment', { x: 1 }) })
            .eq('id', agentVersionId);
        }

        return {
          success: true,
          message: `${voteType === 'up' ? 'Upvoted' : 'Downvoted'} successfully`,
          voteId: newVote.id,
        };
      }
    };

    // Execute transaction
    const transactionResult = await transaction();

    // Get updated vote counts
    const { data: updatedAgent, error: updateError } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();

    if (updateError) throw updateError;

    // Log the vote action
    await logSystemEvent(
      'system',
      'agent',
      `agent_version_${voteType}vote`,
      {
        agent_version_id: agentVersionId,
        user_id: userId,
        has_comment: !!comment
      }
    ).catch(err => console.error('Failed to log vote event:', err));

    return {
      success: transactionResult.success,
      message: transactionResult.message,
      voteId: transactionResult.voteId,
      upvotes: updatedAgent.upvotes || 0,
      downvotes: updatedAgent.downvotes || 0,
    };
  } catch (err: any) {
    console.error('Error casting vote:', err);
    return {
      success: false,
      error: err.message || 'Failed to cast vote',
      upvotes: 0,
      downvotes: 0,
    };
  }
}

/**
 * Handle upvoting an agent version
 * 
 * @param agentVersionId The ID of the agent version
 * @param userId The ID of the user casting the vote
 * @param comment Optional comment with the vote
 * @returns Vote result including updated counts
 */
export function upvoteAgentVersion(
  agentVersionId: string,
  userId: string,
  comment?: string
): Promise<VoteResult> {
  return castVote(agentVersionId, userId, 'up', comment);
}

/**
 * Handle downvoting an agent version
 * 
 * @param agentVersionId The ID of the agent version
 * @param userId The ID of the user casting the vote
 * @param comment Optional comment with the vote
 * @returns Vote result including updated counts
 */
export function downvoteAgentVersion(
  agentVersionId: string, 
  userId: string,
  comment?: string
): Promise<VoteResult> {
  return castVote(agentVersionId, userId, 'down', comment);
}
