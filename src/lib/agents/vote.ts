
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { VoteType } from '@/types/shared';

/**
 * Submit a vote for an agent version
 * 
 * @param agentVersionId The ID of the agent version to vote on
 * @param voteType The type of vote (upvote, downvote, neutral)
 * @param userId The ID of the user voting
 * @param tenantId The ID of the tenant
 * @param comment Optional comment with the vote
 * @returns Result of the vote operation
 */
export async function voteOnAgentVersion(
  agentVersionId: string,
  voteType: VoteType,
  userId: string,
  tenantId: string,
  comment?: string
) {
  try {
    // Log the vote action
    await logSystemEvent('agent', 'info', {
      action: 'vote',
      agent_version_id: agentVersionId,
      vote_type: voteType,
      user_id: userId,
      has_comment: !!comment
    }, tenantId);

    // Check if user has already voted on this agent
    const { data: existingVote } = await supabase
      .from('agent_votes')
      .select('vote_type')
      .eq('agent_version_id', agentVersionId)
      .eq('user_id', userId)
      .single();

    // Record the vote
    if (existingVote) {
      // Update existing vote
      const { error: updateError } = await supabase
        .from('agent_votes')
        .update({
          vote_type: voteType,
          comment: comment || null
        })
        .eq('agent_version_id', agentVersionId)
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from('agent_votes')
        .insert({
          agent_version_id: agentVersionId,
          user_id: userId,
          vote_type: voteType,
          comment
        });

      if (insertError) throw insertError;
    }

    // Get current vote counts
    const { data: agentVersion, error: agentError } = await supabase
      .from('agent_versions')
      .select('upvotes, downvotes')
      .eq('id', agentVersionId)
      .single();

    if (agentError) throw agentError;

    // Calculate new vote counts
    let upvotes = agentVersion?.upvotes || 0;
    let downvotes = agentVersion?.downvotes || 0;

    // Adjust vote counters based on previous and current vote
    if (existingVote) {
      // Undo previous vote
      if (existingVote.vote_type === 'upvote') upvotes = Math.max(0, upvotes - 1);
      if (existingVote.vote_type === 'downvote') downvotes = Math.max(0, downvotes - 1);
    }

    // Apply new vote
    if (voteType === 'upvote') upvotes += 1;
    if (voteType === 'downvote') downvotes += 1;

    // Update agent version vote counts
    const { error: updateError } = await supabase
      .from('agent_versions')
      .update({ upvotes, downvotes })
      .eq('id', agentVersionId);

    if (updateError) throw updateError;

    // Return success with updated counts
    return {
      success: true,
      message: 'Vote recorded successfully',
      upvotes,
      downvotes
    };
  } catch (error: any) {
    console.error('Error recording vote:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to record vote',
      upvotes: 0,
      downvotes: 0
    };
  }
}
