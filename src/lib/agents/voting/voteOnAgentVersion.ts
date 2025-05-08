
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { VoteType } from '@/types/fixed';

/**
 * Vote on an agent version
 * @param agentVersionId The agent version ID to vote on
 * @param voteType The type of vote (upvote or downvote)
 * @param comment Optional comment explaining the vote
 * @returns Result of the voting operation
 */
export async function castVote(
  agentVersionId: string,
  voteType: VoteType,
  comment?: string
): Promise<VoteResult> {
  try {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return {
        success: false,
        upvotes: 0,
        downvotes: 0,
        error: 'You must be logged in to vote'
      };
    }
    
    const userId = session.user.id;
    
    return voteOnAgentVersion(agentVersionId, voteType, userId, comment);
  } catch (err: any) {
    console.error('Error in castVote:', err);
    return {
      success: false,
      upvotes: 0,
      downvotes: 0,
      error: `Failed to cast vote: ${err.message}`
    };
  }
}

/**
 * Vote on an agent version
 * @param agentVersionId The agent version ID to vote on
 * @param voteType The type of vote (upvote or downvote)
 * @param userId The user ID casting the vote
 * @param comment Optional comment explaining the vote
 * @returns Result of the voting operation
 */
export async function voteOnAgentVersion(
  agentVersionId: string,
  voteType: VoteType,
  userId: string,
  comment?: string
): Promise<VoteResult> {
  try {
    // Check if user has already voted on this agent version
    const { data: existingVote, error: checkError } = await supabase
      .from('agent_votes')
      .select('*')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing vote:', checkError);
      return {
        success: false,
        upvotes: 0,
        downvotes: 0,
        error: `Failed to check existing vote: ${checkError.message}`
      };
    }

    // If user has already voted, update their vote
    if (existingVote) {
      // If same vote type, remove the vote (toggle off)
      if (existingVote.vote_type === voteType) {
        const { error: deleteError } = await supabase
          .from('agent_votes')
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) {
          return {
            success: false,
            upvotes: 0,
            downvotes: 0,
            error: `Failed to remove vote: ${deleteError.message}`
          };
        }
      } else {
        // Otherwise, change the vote type
        const { error: updateError } = await supabase
          .from('agent_votes')
          .update({
            vote_type: voteType,
            comment: comment || existingVote.comment
          })
          .eq('id', existingVote.id);

        if (updateError) {
          return {
            success: false,
            upvotes: 0,
            downvotes: 0,
            error: `Failed to update vote: ${updateError.message}`
          };
        }
      }
    } else {
      // If no existing vote, create a new one
      const { error: insertError } = await supabase
        .from('agent_votes')
        .insert({
          agent_version_id: agentVersionId,
          user_id: userId,
          vote_type: voteType,
          comment
        });

      if (insertError) {
        return {
          success: false,
          upvotes: 0,
          downvotes: 0,
          error: `Failed to cast vote: ${insertError.message}`
        };
      }
    }

    // Get updated vote counts
    const { data: agentVersion, error: fetchError } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();

    if (fetchError || !agentVersion) {
      return {
        success: false,
        upvotes: 0,
        downvotes: 0,
        error: `Failed to fetch updated vote counts: ${fetchError?.message}`
      };
    }

    // Log the voting event
    await logSystemEvent(
      'agent',
      'info',
      {
        event: 'agent_voted',
        agent_version_id: agentVersionId,
        vote_type: voteType,
        user_id: userId
      }
    ).catch(error => console.error('Error logging vote event:', error));

    return {
      success: true,
      upvotes: agentVersion.upvotes,
      downvotes: agentVersion.downvotes,
      message: `Successfully ${voteType === 'upvote' ? 'upvoted' : 'downvoted'} agent version`
    };
  } catch (err: any) {
    console.error('Error voting on agent version:', err);
    return {
      success: false,
      upvotes: 0,
      downvotes: 0,
      error: `Unexpected error: ${err.message}`
    };
  }
}

/**
 * Get user's vote on an agent version
 * @param agentVersionId The agent version ID
 * @param userId The user ID
 * @returns Information about the user's vote
 */
export async function getUserVote(agentVersionId: string, userId?: string) {
  try {
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return {
          success: false,
          hasVoted: false,
          vote: null,
          error: "Not authenticated"
        };
      }
      userId = session.user.id;
    }
    
    const { data, error } = await supabase
      .from('agent_votes')
      .select('*')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return {
        success: false,
        hasVoted: false,
        vote: null,
        error: `Failed to get vote: ${error.message}`
      };
    }

    return {
      success: true,
      hasVoted: !!data,
      vote: data
    };
  } catch (err: any) {
    return {
      success: false,
      hasVoted: false,
      vote: null,
      error: `Unexpected error: ${err.message}`
    };
  }
}

/**
 * Upvote an agent version
 * @param agentVersionId The agent version ID
 * @param comment Optional comment
 */
export async function upvoteAgentVersion(
  agentVersionId: string,
  comment?: string
): Promise<VoteResult> {
  return castVote(agentVersionId, 'upvote', comment);
}

/**
 * Downvote an agent version
 * @param agentVersionId The agent version ID
 * @param comment Optional comment
 */
export async function downvoteAgentVersion(
  agentVersionId: string,
  comment?: string
): Promise<VoteResult> {
  return castVote(agentVersionId, 'downvote', comment);
}

export interface VoteResult {
  success: boolean;
  upvotes: number;
  downvotes: number;
  message?: string;
  error?: string;
}
