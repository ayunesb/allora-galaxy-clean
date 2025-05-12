
import { supabase } from '@/integrations/supabase/client';
import type { VoteType } from '@/types/shared';
import { VoteResult } from '../voting/types';
import logSystemEvent from '@/lib/system/logSystemEvent';

/**
 * Vote on an agent version
 * @param userId User ID casting the vote
 * @param agentVersionId Agent version ID to vote on
 * @param voteType Type of vote (upvote or downvote)
 * @param comment Optional comment with the vote
 * @param tenantId Optional tenant ID
 * @returns Vote result
 */
export async function voteOnAgentVersion(
  userId: string,
  agentVersionId: string,
  voteType: VoteType,
  comment?: string,
  tenantId?: string
): Promise<VoteResult> {
  try {
    // Check if user has already voted
    const { data: existingVote, error: checkError } = await supabase
      .from('agent_votes')
      .select('id, vote_type')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing vote:', checkError);
      return {
        success: false,
        error: 'Failed to check for existing vote',
        upvotes: 0,
        downvotes: 0
      };
    }

    // Convert vote type to database format
    const dbVoteType = voteType === 'upvote' ? 'up' : 'down';
    
    // Handle existing vote logic
    if (existingVote) {
      if (existingVote.vote_type === dbVoteType) {
        // Same vote type - remove vote
        const { error: deleteError } = await supabase
          .from('agent_votes')
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) throw deleteError;
      } else {
        // Different vote type - update vote
        const { error: updateError } = await supabase
          .from('agent_votes')
          .update({
            vote_type: dbVoteType,
            comment: comment
          })
          .eq('id', existingVote.id);

        if (updateError) throw updateError;
      }
    } else {
      // New vote
      const { error: insertError } = await supabase
        .from('agent_votes')
        .insert([{
          agent_version_id: agentVersionId,
          user_id: userId,
          vote_type: dbVoteType,
          comment
        }]);

      if (insertError) throw insertError;
    }

    // Get updated vote counts
    const { data: agentVersion, error: fetchError } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();

    if (fetchError) throw fetchError;
    
    // Log the vote action
    await logSystemEvent(
      'agent',
      'agent_vote',
      {
        agent_version_id: agentVersionId,
        vote_type: voteType,
        comment: comment
      },
      tenantId
    );
    
    return {
      success: true,
      message: existingVote ? 'Vote updated' : 'Vote recorded',
      upvotes: agentVersion?.upvotes || 0,
      downvotes: agentVersion?.downvotes || 0
    };
  } catch (error: any) {
    console.error('Error voting on agent version:', error);
    return {
      success: false,
      error: error.message || 'Failed to process vote',
      upvotes: 0,
      downvotes: 0
    };
  }
}

export default voteOnAgentVersion;
