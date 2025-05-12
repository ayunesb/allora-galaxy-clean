
import { supabase } from '@/integrations/supabase/client';
import { VoteType } from '@/types/shared';
import { AgentVote, VoteResult } from '@/types/agent';

/**
 * Vote on an agent version
 * @param agentVersionId - ID of the agent version
 * @param userId - ID of the user casting the vote
 * @param voteType - Type of vote (upvote or downvote)
 * @param comment - Optional comment with the vote
 * @returns Vote result object
 */
export async function voteOnAgentVersion(
  agentVersionId: string,
  userId: string,
  voteType: VoteType,
  comment?: string
): Promise<VoteResult> {
  try {
    // Check if user has already voted on this version
    const { data: existingVote, error: checkError } = await supabase
      .from('agent_votes')
      .select('id, vote_type')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // Error other than "no rows returned"
      console.error('Error checking for existing vote:', checkError);
      return {
        success: false,
        error: 'Failed to check for existing vote',
        upvotes: 0,
        downvotes: 0
      };
    }

    let result;

    // Convert vote type to database format
    const dbVoteType = voteType === 'upvote' ? 'up' : 'down';

    if (existingVote) {
      // User has already voted - update their vote
      if (existingVote.vote_type === dbVoteType) {
        // Vote is the same, treat as removing vote
        const { error: deleteError } = await supabase
          .from('agent_votes')
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) {
          throw deleteError;
        }

        result = {
          success: true,
          message: 'Vote removed successfully',
          voteId: null
        };
      } else {
        // Change vote type
        const { data: updatedVote, error: updateError } = await supabase
          .from('agent_votes')
          .update({
            vote_type: dbVoteType,
            comment: comment || existingVote.comment
          })
          .eq('id', existingVote.id)
          .select('id');

        if (updateError) {
          throw updateError;
        }

        result = {
          success: true,
          message: `Vote changed to ${voteType}`,
          voteId: updatedVote?.[0]?.id
        };
      }
    } else {
      // New vote
      const vote: AgentVote = {
        agent_version_id: agentVersionId,
        user_id: userId,
        vote_type: dbVoteType,
        comment
      };

      const { data: newVote, error: insertError } = await supabase
        .from('agent_votes')
        .insert([vote])
        .select('id');

      if (insertError) {
        throw insertError;
      }

      result = {
        success: true,
        message: `Successfully ${voteType}d`,
        voteId: newVote?.[0]?.id
      };
    }

    // Get updated counts
    const { data: agentVersion, error: countError } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();

    if (countError) {
      throw countError;
    }

    return {
      ...result,
      upvotes: agentVersion.upvotes || 0,
      downvotes: agentVersion.downvotes || 0
    };
  } catch (error: any) {
    console.error('Error voting on agent version:', error);
    return {
      success: false,
      error: error.message || 'Error voting on agent version',
      upvotes: 0,
      downvotes: 0
    };
  }
}

export default voteOnAgentVersion;
